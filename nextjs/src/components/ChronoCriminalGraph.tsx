"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";

// ── TypeScript Type Definitions ──────────────────────────────────────────────

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  total_firs?: number;
  crime_types?: string[];
  first_crime_date?: string; // YYYY-MM-DD
  last_crime_date?: string;  // YYYY-MM-DD
  risk_score?: number;
  size?: number;
  color?: string;
  district?: string;
}

export interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  fir_case_number?: string;
  date?: string;             // YYYY-MM-DD
  crime_type?: string;
  weight?: number;
  label?: string;
}

interface DateRange {
  min: string;              // YYYY-MM-DD
  max: string;              // YYYY-MM-DD
}

interface ChronoCriminalGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  date_range?: DateRange;
  onNodeClick?: (nodeId: string) => void;
  height?: number;
}

// ── Crime Color Map ───────────────────────────────────────────────────────────

const CRIME_COLORS: Record<string, string> = {
  vehicle_theft:   "#3b82f6", // blue
  robbery:         "#ef4444", // red
  burglary:        "#f97316", // orange
  chain_snatching: "#f59e0b", // amber
  assault:         "#dc2626", // dark red
  fraud:           "#8b5cf6", // purple
  cybercrime:      "#06b6d4", // cyan
  drug_offence:    "#10b981", // emerald
  surveillance:    "#00f0ff", // neon cyan
  other:           "#6b7280", // gray
};

const getEdgeColor = (crimeType?: string): string => {
  if (!crimeType) return CRIME_COLORS.other;
  return CRIME_COLORS[crimeType] || CRIME_COLORS.other;
};

// Helper to truncate text to 14 chars
const truncateLabel = (text: string): string => {
  if (!text) return "";
  if (text.length > 14) {
    return text.substring(0, 12) + "..";
  }
  return text;
};

export default function ChronoCriminalGraph({
  nodes,
  edges,
  date_range = { min: "2025-01-01", max: "2026-07-18" },
  onNodeClick,
  height = 550,
}: ChronoCriminalGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Time window bounds
  const minTime = useMemo(() => new Date(date_range.min).getTime() || new Date("2025-01-01").getTime(), [date_range.min]);
  const maxTime = useMemo(() => new Date(date_range.max).getTime() || new Date("2026-07-18").getTime(), [date_range.max]);

  // Playback States
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(maxTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(5);

  // Search filter
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Current formatted date to display
  const currentDateString = useMemo(() => {
    return new Date(currentTimestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [currentTimestamp]);

  // Handle Play/Pause timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentTimestamp((prev) => {
          const stepSizeMs = speed * 7 * 24 * 60 * 60 * 1000;
          const next = prev + stepSizeMs;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, speed, maxTime]);

  const handlePlayPause = () => {
    if (currentTimestamp >= maxTime) {
      setCurrentTimestamp(minTime);
    }
    setIsPlaying(!isPlaying);
  };

  // ── D3 Force Simulation & Render Effect ─────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const svg = d3.select(svgRef.current);
    
    svg.selectAll("*").remove();

    // Defs for glowing filters
    const defs = svg.append("defs");
    
    // Red Glow
    const redGlow = defs.append("filter")
      .attr("id", "glow-red")
      .attr("x", "-50%").attr("y", "-50%")
      .attr("width", "200%").attr("height", "200%");
    redGlow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const redMerge = redGlow.append("feMerge");
    redMerge.append("feMergeNode").attr("in", "coloredBlur");
    redMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Blue Glow
    const blueGlow = defs.append("filter")
      .attr("id", "glow-blue")
      .attr("x", "-50%").attr("y", "-50%")
      .attr("width", "200%").attr("height", "200%");
    blueGlow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const blueMerge = blueGlow.append("feMerge");
    blueMerge.append("feMergeNode").attr("in", "coloredBlur");
    blueMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create main zoom/pan container
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Filter nodes based on timestamp
    const visibleNodes = nodes.map(n => ({ ...n })).filter((n) => {
      if (!n.first_crime_date) return true;
      return new Date(n.first_crime_date).getTime() <= currentTimestamp;
    });

    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

    // Filter edges
    const visibleEdges = edges
      .map(e => ({ ...e }))
      .filter((e) => {
        const sourceId = typeof e.source === "object" ? (e.source as GraphNode).id : (e.source as string);
        const targetId = typeof e.target === "object" ? (e.target as GraphNode).id : (e.target as string);
        const edgeDateOk = !e.date || new Date(e.date).getTime() <= currentTimestamp;
        return (
          edgeDateOk &&
          visibleNodeIds.has(sourceId) &&
          visibleNodeIds.has(targetId)
        );
      });

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode>(visibleNodes)
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GraphNode>().radius(d => (d.size || 16) + 20))
      .force("link", d3.forceLink<GraphNode, GraphEdge>(visibleEdges)
        .id(d => d.id)
        .distance(120)
      )
      .force("gang_x", d3.forceX<GraphNode>(d => {
        if ((d as any).gang_id === "GANG-NORTH") return width * 0.35;
        if ((d as any).gang_id === "GANG-SOUTH") return width * 0.65;
        return width / 2;
      }).strength(0.12))
      .force("gang_y", d3.forceY<GraphNode>(_ => height / 2).strength(0.05));

    // Render group elements
    const linkGroup = g.append("g").attr("class", "links");
    const nodeGroup = g.append("g").attr("class", "nodes");

    // Update simulation positions on tick
    simulation.on("tick", () => {
      linkGroup.selectAll<SVGLineElement, GraphEdge>("line")
        .attr("x1", d => (d.source as GraphNode).x || 0)
        .attr("y1", d => (d.source as GraphNode).y || 0)
        .attr("x2", d => (d.target as GraphNode).x || 0)
        .attr("y2", d => (d.target as GraphNode).y || 0);

      nodeGroup.selectAll<SVGGElement, GraphNode>("g")
        .attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // ── Update Links ──
    const linkSel = linkGroup.selectAll<SVGLineElement, GraphEdge>("line")
      .data(visibleEdges, d => d.id || `${typeof d.source === 'object' ? d.source.id : d.source}-${typeof d.target === 'object' ? d.target.id : d.target}`);

    linkSel.exit().remove();

    const linkEnter = linkSel.enter()
      .append("line")
      .attr("stroke", d => {
        const sId = typeof d.source === 'object' ? (d.source as GraphNode).id : d.source as string;
        const tId = typeof d.target === 'object' ? (d.target as GraphNode).id : d.target as string;
        const sNode = visibleNodes.find(n => n.id === sId);
        const tNode = visibleNodes.find(n => n.id === tId);
        const sGang = (sNode as any)?.gang_id;
        const tGang = (tNode as any)?.gang_id;
        if (sGang && tGang && sGang === tGang) {
          return sGang === "GANG-NORTH" ? "#f97316" : "#8b5cf6";
        }
        if (sGang && tGang && sGang !== tGang) return "#ef4444"; // cross-gang link
        return getEdgeColor(d.crime_type);
      })
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", d => Math.max(2, d.weight || 2))
      .attr("stroke-dasharray", d => d.crime_type === 'surveillance' ? '4 3' : 'none');

    linkEnter.merge(linkSel);

    // ── Gang label badges above each cluster ──
    const gangLabels = [
      { id: "GANG-NORTH", label: "▲ GANG-NORTH", x: width * 0.30, y: 40, color: "#f97316" },
      { id: "GANG-SOUTH", label: "▲ GANG-SOUTH", x: width * 0.65, y: 40, color: "#8b5cf6" },
    ];
    g.selectAll(".gang-label")
      .data(gangLabels)
      .enter()
      .append("text")
      .attr("class", "gang-label")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.color)
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("font-family", "monospace")
      .style("opacity", "0.7")
      .text(d => d.label);

    // ── Update Nodes ──
    const nodeSel = nodeGroup.selectAll<SVGGElement, GraphNode>("g")
      .data(visibleNodes, d => d.id);

    nodeSel.exit().remove();

    const nodeEnter = nodeSel.enter()
      .append("g")
      .attr("class", "cursor-pointer transition-opacity duration-200")
      .on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d.id);
      })
      .on("mouseover", (event, d) => {
        // Highlight connected links & nodes
        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(d.id);
        
        visibleEdges.forEach(e => {
          const sId = typeof e.source === 'object' ? e.source.id : e.source;
          const tId = typeof e.target === 'object' ? e.target.id : e.target;
          if (sId === d.id) connectedNodeIds.add(tId);
          if (tId === d.id) connectedNodeIds.add(sId);
        });

        nodeGroup.selectAll<SVGGElement, GraphNode>("g")
          .style("opacity", n => connectedNodeIds.has(n.id) ? "1" : "0.2");

        linkGroup.selectAll<SVGLineElement, GraphEdge>("line")
          .style("stroke-opacity", l => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source;
            const tId = typeof l.target === 'object' ? l.target.id : l.target;
            return (sId === d.id || tId === d.id) ? "1" : "0.1";
          })
          .style("stroke-width", l => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source;
            const tId = typeof l.target === 'object' ? l.target.id : l.target;
            return (sId === d.id || tId === d.id) ? "4" : "1.5";
          });

        if (tooltipRef.current) {
          const riskColor = (d.risk_score || 0) > 70 ? '#ef4444' : (d.risk_score || 0) > 40 ? '#f59e0b' : '#10b981';
          const types = d.crime_types || [d.type || 'unknown'];

          tooltipRef.current.innerHTML = `
            <div class="font-mono font-bold text-paper-100 text-sm mb-1">${d.label}</div>
            <div class="text-paper-100/70 text-xs font-mono">Category: <span class="text-paper-100 font-semibold uppercase">${d.type}</span></div>
            ${(d as any).gang_id ? `<div class="text-paper-100/70 text-xs font-mono">Gang: <span class="font-bold" style="color: ${(d as any).gang_id === 'GANG-NORTH' ? '#f97316' : '#8b5cf6'}">${(d as any).gang_id}</span></div>` : ''}
            ${d.type === 'accused' ? `<div class="text-paper-100/70 text-xs font-mono">FIR Count: <span class="text-phosphor-500 font-bold">${d.total_firs || 1}</span></div>` : ''}
            ${d.risk_score ? `<div class="text-paper-100/70 text-xs font-mono">Threat Index: <span class="font-bold" style="color: ${riskColor}">${d.risk_score}/100</span></div>` : ''}
            <div class="mt-2 flex flex-wrap gap-1">
              ${types.map(t => `<span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold" style="background-color: ${getEdgeColor(t)}25; color: ${getEdgeColor(t)}">${t.replace('_', ' ')}</span>`).join('')}
            </div>
          `;
          tooltipRef.current.style.opacity = "1";
        }
      })
      .on("mousemove", (event) => {
        if (!tooltipRef.current) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const x = event.clientX - rect.left + 15;
          const y = event.clientY - rect.top + 15;
          tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
      })
      .on("mouseout", () => {
        nodeGroup.selectAll<SVGGElement, GraphNode>("g").style("opacity", "1");
        linkGroup.selectAll<SVGLineElement, GraphEdge>("line").style("stroke-opacity", "0.7").style("stroke-width", d => Math.max(2, d.weight || 2));
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
        }
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

    // Pulsing warning ring for Critical risk score (> 70)
    nodeEnter.filter(d => (d.risk_score || 0) > 70)
      .append("circle")
      .attr("r", d => (d.size || 16) + 7)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("class", "animate-pulse-ring");

    // Main Node Shapes
    // Case nodes -> Square / Diamond
    // Camera nodes -> Cyan Hexagon
    // Accused nodes -> Circle
    nodeEnter.each(function(d) {
      const gNode = d3.select(this);
      const nodeSize = d.size || 16;

      if (d.type === 'case') {
        const nodeColor = '#2d83d9';
        gNode.append("rect")
          .attr("x", -nodeSize)
          .attr("y", -nodeSize)
          .attr("width", nodeSize * 2)
          .attr("height", nodeSize * 2)
          .attr("rx", 4)
          .attr("fill", nodeColor)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .attr("filter", "url(#glow-blue)");
        
        gNode.append("text")
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#ffffff")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("pointer-events", "none")
          .text("FIR");

      } else if (d.type === 'camera') {
        gNode.append("circle")
          .attr("r", nodeSize)
          .attr("fill", "#0284c7")
          .attr("stroke", "#00f0ff")
          .attr("stroke-width", 2)
          .attr("filter", "url(#glow-blue)");

        gNode.append("text")
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#00f0ff")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .style("pointer-events", "none")
          .text("CAM");

      } else {
        // Accused Suspect Circle
        const gangId = (d as any).gang_id;
        const nodeColor = gangId === "GANG-NORTH" ? "#f97316" : gangId === "GANG-SOUTH" ? "#8b5cf6" : (d.color || "#f0a848");
        gNode.append("circle")
          .attr("r", nodeSize)
          .attr("fill", nodeColor)
          .attr("stroke", (d.risk_score || 0) > 70 ? "#ef4444" : "#0f172a")
          .attr("stroke-width", 2)
          .attr("filter", (d.risk_score || 0) > 70 ? "url(#glow-red)" : "none");

        // Initials inside circle
        const initials = d.label.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        gNode.append("text")
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#ffffff")
          .style("font-size", "11px")
          .style("font-weight", "800")
          .style("font-family", "monospace")
          .style("pointer-events", "none")
          .text(initials);
      }
    });

    // Node Label with background pill
    nodeEnter.each(function(d) {
      const gNode = d3.select(this);
      const nodeSize = d.size || 16;
      const labelText = truncateLabel(d.label);

      const labelG = gNode.append("g")
        .attr("transform", `translate(0, ${nodeSize + 16})`);

      labelG.append("rect")
        .attr("x", -((labelText.length * 6) / 2 + 6))
        .attr("y", -11)
        .attr("width", labelText.length * 6 + 12)
        .attr("height", 16)
        .attr("rx", 4)
        .attr("fill", "#0d1527")
        .attr("fill-opacity", 0.9)
        .attr("stroke", "#26354a")
        .attr("stroke-width", 1);

      labelG.append("text")
        .attr("dy", 1)
        .attr("text-anchor", "middle")
        .attr("fill", "#f8fafc")
        .style("font-size", "10px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .style("pointer-events", "none")
        .text(labelText);
    });

    nodeEnter.merge(nodeSel);

    // ── Drag Handlers ──
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };

  }, [nodes, edges, currentTimestamp, height]);

  // Search term filter effect
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    if (!searchTerm.trim()) {
      svg.selectAll("g.nodes g").style("opacity", "1");
      svg.selectAll("g.links line").style("stroke-opacity", "0.7");
      return;
    }

    const term = searchTerm.toLowerCase();
    svg.selectAll<SVGGElement, GraphNode>("g.nodes g")
      .style("opacity", d => (d.label.toLowerCase().includes(term) || d.id.toLowerCase().includes(term)) ? "1" : "0.15");
  }, [searchTerm]);

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl bg-steel-700 p-6 border border-steel-600/50 shadow-2xl flex flex-col select-none overflow-hidden text-paper-100 transition-colors duration-200">
      
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.8;
          }
        }
        .animate-pulse-ring {
          transform-origin: center;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 z-10">
        <div>
          <h3 className="text-lg font-bold text-paper-100 tracking-wide font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-critical-500 animate-ping inline-block" />
            Chrono-Criminal Network Graph
          </h3>
          <p className="text-xs text-paper-100/50 mt-0.5">
            Real-time gang affiliation & co-accused case correlations. Drag nodes to explore.
          </p>
        </div>
        
        {/* Controls bar */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search suspect / FIR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-void-000 border border-steel-600/60 rounded-xl text-xs text-paper-100 placeholder-paper-100/40 focus:outline-none focus:border-phosphor-500 transition-colors font-mono w-44"
          />

          {/* Date Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-void-000 border border-steel-600/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-phosphor-500 animate-pulse" />
            <span className="text-xs font-semibold font-mono text-phosphor-500">
              {currentDateString}
            </span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute left-0 top-0 z-50 rounded-xl border border-steel-600 bg-steel-700/95 p-3 shadow-2xl backdrop-blur-md opacity-0 transition-opacity duration-200 w-56 text-paper-100"
        style={{ transform: "translate(0px, 0px)" }}
      />

      {/* Visualization Canvas */}
      <div className="relative w-full rounded-xl bg-void-000/60 border border-steel-600/50 overflow-hidden flex-grow" style={{ height }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ height }}
        />
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-paper-100/50 text-sm font-mono">
            No network nodes loaded.
          </div>
        )}
      </div>

      {/* Playback Control Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 bg-void-000/40 border border-steel-600/40 p-4 rounded-xl">
        
        {/* Play button */}
        <button
          onClick={handlePlayPause}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-phosphor-500 text-paper-100 hover:bg-phosphor-500/80 active:scale-95 transition-all shadow-lg shadow-phosphor-500/20"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Range Slider */}
        <div className="flex-grow w-full flex items-center gap-3">
          <span className="text-xs text-paper-100/50 font-mono">
            {new Date(minTime).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
          </span>
          <input
            type="range"
            min={minTime}
            max={maxTime}
            value={currentTimestamp}
            onChange={(e) => {
              setCurrentTimestamp(parseInt(e.target.value, 10));
              setIsPlaying(false);
            }}
            className="w-full h-1.5 bg-steel-600 rounded-lg appearance-none cursor-pointer accent-phosphor-500 focus:outline-none"
          />
          <span className="text-xs text-paper-100/50 font-mono">
            {new Date(maxTime).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-void-000 p-1 rounded-lg border border-steel-600/40 shrink-0">
          {[1, 5, 20].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                speed === s
                  ? "bg-steel-600 text-phosphor-500 border border-steel-600/50 shadow-inner"
                  : "text-paper-100/50 hover:text-paper-100"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
