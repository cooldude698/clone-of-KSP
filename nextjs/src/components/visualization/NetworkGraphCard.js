'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function NetworkGraphCard({ data, title }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 400;
    const height = 260;

    const nodes = data.nodes.map((n) => ({ ...n }));
    const edges = data.edges.map((e) => ({ ...e }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d) => d.id).distance(70))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(20));

    // Edges
    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', (d) => d.color || 'var(--color-steel-600)')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    // Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.size || 8)
      .attr('fill', (d) => d.color || 'var(--color-phosphor-500)')
      .attr('stroke', 'var(--color-void-000)')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

    // Labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.label || d.id)
      .attr('font-size', 9)
      .attr('fill', 'var(--color-paper-100)')
      .attr('fill-opacity', 0.6)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.size || 8) + 12)
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      label.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });

    return () => simulation.stop();
  }, [data]);

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="rounded-xl bg-steel-700 border border-steel-600/40 p-4">
        <p className="text-xs text-paper-100/70 font-semibold mb-3">{title}</p>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-paper-100/40">No network data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-steel-700 border border-steel-600/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-steel-600/40">
        <p className="text-xs font-semibold text-paper-100/80">{title}</p>
        <p className="text-[10px] text-paper-100/40 mt-0.5">Drag nodes to explore connections</p>
      </div>
      <div className="bg-void-000">
        <svg ref={svgRef} width="100%" height="260" />
      </div>
      <div className="px-4 py-2 border-t border-steel-600/40 flex gap-4">
        <span className="text-[10px] text-paper-100/50">{data.nodes.length} suspects</span>
        <span className="text-[10px] text-paper-100/50">{data.edges.length} connections</span>
      </div>
    </div>
  );
}
