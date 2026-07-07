"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";

// ── TypeScript Type Definitions ──────────────────────────────────────────────

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  total_firs: number;
  crime_types: string[];
  first_crime_date: string; // YYYY-MM-DD
  last_crime_date: string;  // YYYY-MM-DD
  risk_score: number;
  size: number;
  color: string;
}

export interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  fir_case_number: string;
  date: string;             // YYYY-MM-DD
  crime_type: string;
  weight: number;
}

interface DateRange {
  min: string;              // YYYY-MM-DD
  max: string;              // YYYY-MM-DD
}

interface ChronoCriminalGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  date_range: DateRange;
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
  other:           "#6b7280", // gray
};

const getEdgeColor = (crimeType: string): string => {
  return CRIME_COLORS[crimeType] || CRIME_COLORS.other;
};

// Helper to truncate text to 12 chars
const truncateLabel = (text: string): string => {
  if (text.length > 12) {
    return text.substring(0, 10) + "...";
  }
  return text;
};

export default function ChronoCriminalGraph({
  nodes,
  edges,
  date_range,
  onNodeClick,
  height = 500,
}: ChronoCriminalGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Time window bounds
  const minTime = useMemo(() => new Date(date_range.min).getTime(), [date_range.min]);
  const maxTime = useMemo(() => new Date(date_range.max).getTime(), [date_range.max]);

  // Playback States
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(minTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(5); // Default 5x (5 * 7 days per 100ms)

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
          const stepSizeMs = speed * 7 * 24 * 60 * 60 * 1000; // speed * 7 days in ms
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

  // Reset to start if timeline reaches the end
  const handlePlayPause = () => {
    if (currentTimestamp >= maxTime) {
      setCurrentTimestamp(minTime);
    }
    setIsPlaying(!isPlaying);
  };

  // ── D3 Force Simulation & Render Effect ─────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const svg = d3.select(svgRef.current);
    
    // Clear initial markup or previous static groups
    svg.selectAll("*").remove();

    // Create main zoom/pan container
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Filter nodes and edges based on current timestamp
    // Node visible if first_crime_date <= currentTimestamp
    const visibleNodes = nodes.map(n => ({ ...n })).filter((n) => {
      return new Date(n.first_crime_date).getTime() <= currentTimestamp;
    });

    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

    // Edge visible if edge.date <= currentTimestamp AND both endpoints are visible nodes
    const visibleEdges = edges
      .map(e => ({ ...e }))
      .filter((e) => {
        const sourceId = typeof e.source === "object" ? e.source.id : e.source;
        const targetId = typeof e.target === "object" ? e.target.id : e.target;
        return (
          new Date(e.date).getTime() <= currentTimestamp &&
          visibleNodeIds.has(sourceId) &&
          visibleNodeIds.has(targetId)
        );
      });

    // Create D3 Force simulation
    const simulation = d3.forceSimulation<GraphNode>(visibleNodes)
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GraphNode>().radius(d => d.size + 15))
      .force("link", d3.forceLink<GraphNode, GraphEdge>(visibleEdges)
        .id(d => d.id)
        .distance(100)
      );

    // Render group elements
    const linkGroup = g.append("g").attr("class", "links");
    const nodeGroup = g.append("g").attr("class", "nodes");

    // Update simulation on tick
    simulation.on("tick", () => {
      // Update link lines
      linkGroup.selectAll<SVGLineElement, GraphEdge>("line")
        .attr("x1", d => (d.source as GraphNode).x || 0)
        .attr("y1", d => (d.source as GraphNode).y || 0)
        .attr("x2", d => (d.target as GraphNode).x || 0)
        .attr("y2", d => (d.target as GraphNode).y || 0);

      // Update node group containers
      nodeGroup.selectAll<SVGGElement, GraphNode>("g")
        .attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // ── Update Links ──
    const linkSel = linkGroup.selectAll<SVGLineElement, GraphEdge>("line")
      .data(visibleEdges, d => d.id);

    // Remove old links
    linkSel.exit().remove();

    // Enter new links
    const linkEnter = linkSel.enter()
      .append("line")
      .attr("stroke", d => getEdgeColor(d.crime_type))
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.max(1.5, d.weight))
      .attr("class", "transition-all duration-300 ease-out");

    // Merge selections
    linkEnter.merge(linkSel);

    // ── Update Nodes ──
    const nodeSel = nodeGroup.selectAll<SVGGElement, GraphNode>("g")
      .data(visibleNodes, d => d.id);

    // Remove old nodes
    nodeSel.exit().remove();

    // Enter new node containers
    const nodeEnter = nodeSel.enter()
      .append("g")
      .attr("class", "cursor-pointer transition-opacity duration-300 ease-out")
      .on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d.id);
      })
      .on("mouseover", (event, d) => {
        if (!tooltipRef.current) return;
        
        // Populate custom tooltip content
        tooltipRef.current.innerHTML = `
          <div class="font-bold text-white text-sm mb-1">${d.label}</div>
          <div class="text-slate-300 text-xs">Total Cases: <span class="text-blue-400 font-semibold">${d.total_firs}</span></div>
          <div class="text-slate-300 text-xs">Risk Score: <span class="font-bold" style="color: ${d.risk_score > 70 ? '#ef4444' : d.risk_score > 40 ? '#f97316' : '#3b82f6'}">${d.risk_score}</span></div>
          <div class="mt-1.5 flex flex-wrap gap-1">
            ${d.crime_types.map(t => `<span class="px-1.5 py-0.5 rounded text-[10px] font-medium" style="background-color: ${getEdgeColor(t)}22; color: ${getEdgeColor(t)}">${t.replace('_', ' ')}</span>`).join('')}
          </div>
        `;
        tooltipRef.current.style.opacity = "1";
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
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
        }
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

    // Node: Add secondary pulsing ring for high risk score (> 70)
    nodeEnter.filter(d => d.risk_score > 70)
      .append("circle")
      .attr("r", d => d.size + 6)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("class", "animate-pulse-ring");

    // Node: Add main node circle
    nodeEnter.append("circle")
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 1.5)
      .attr("class", "hover:brightness-125 transition-all duration-150");

    // Node: Add label text
    nodeEnter.append("text")
      .attr("dy", d => d.size + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#f8fafc")
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("pointer-events", "none")
      .text(d => truncateLabel(d.label));

    // Merge selection node references
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

    // Cleanup simulation on unmount
    return () => {
      simulation.stop();
    };

  }, [nodes, edges, currentTimestamp, height]);

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl bg-slate-950 p-6 border border-slate-900 shadow-2xl flex flex-col select-none overflow-hidden">
      
      {/* Self-contained styling block for custom pulse keyframes */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.4;
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
          <h3 className="text-lg font-bold text-white tracking-wide">
            Chrono-Criminal Network Graph
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Suspect affiliations mapped over time based on shared case filings.
          </p>
        </div>
        
        {/* Playback Date Badge */}
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold font-mono text-emerald-400">
            {currentDateString}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute left-0 top-0 z-50 rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-xl backdrop-blur-md opacity-0 transition-opacity duration-200 w-52"
        style={{ transform: "translate(0px, 0px)" }}
      />

      {/* Visualization Canvas */}
      <div className="relative w-full rounded-xl bg-slate-900/40 border border-slate-900 overflow-hidden flex-grow" style={{ height }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ height }}
        />
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            No active nodes in this date range.
          </div>
        )}
      </div>

      {/* Playback Control Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 border border-slate-900 p-4 rounded-xl">
        
        {/* Play button */}
        <button
          onClick={handlePlayPause}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          {isPlaying ? (
            // Pause Icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
            </svg>
          ) : (
            // Play Icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Range Slider */}
        <div className="flex-grow w-full flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
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
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
          />
          <span className="text-xs text-slate-400 font-mono">
            {new Date(maxTime).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          {[1, 5, 20].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                speed === s
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner"
                  : "text-slate-400 hover:text-slate-200"
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
