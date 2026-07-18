'use client';

import { Component } from 'react';
import { HeatmapCardDynamic, MapPinsCardDynamic, GeoTrailCardDynamic } from './dynamic-imports';
import BarChartCard from './BarChartCard';
import LineChartCard from './LineChartCard';
import TimelineCard from './TimelineCard';
import NetworkGraphCard from './NetworkGraphCard';

// ── Proper React error boundary ───────────────────────────────────
class VizErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-20 flex items-center justify-center rounded-lg bg-steel-700 border border-steel-600/40">
          <p className="text-xs text-paper-100/50">Visualization unavailable</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Router ────────────────────────────────────────────────────────
function InnerRouter({ visualization }) {
  if (!visualization || visualization.type === 'none') return null;

  const { type, title, data } = visualization;

  switch (type) {
    case 'heatmap':
      return <HeatmapCardDynamic data={data} title={title} />;
    case 'map_pins':
      return <MapPinsCardDynamic data={data} title={title} />;
    case 'bar_chart':
      return <BarChartCard data={data} title={title} />;
    case 'line_chart':
      return <LineChartCard data={data} title={title} />;
    case 'network_graph':
      return <NetworkGraphCard data={data} title={title} />;
    case 'timeline':
      return <TimelineCard data={data} title={title} />;
    case 'geo_trail':
      return <GeoTrailCardDynamic data={data} title={title} />;
    default:
      return null;
  }
}

export default function VisualizationRouter({ visualization }) {
  if (!visualization || visualization.type === 'none') return null;
  return (
    <VizErrorBoundary>
      <InnerRouter visualization={visualization} />
    </VizErrorBoundary>
  );
}
