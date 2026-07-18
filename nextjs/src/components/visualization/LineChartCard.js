'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-steel-700 border border-steel-600/40 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-paper-100/60 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LineChartCard({ data, title }) {
  if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
    return (
      <div className="rounded-xl bg-steel-700 border border-steel-600/40 p-4">
        <p className="text-xs text-paper-100/70 font-semibold mb-3">{title}</p>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-paper-100/40">No data available</p>
        </div>
      </div>
    );
  }

  // Merge datasets into recharts format: [{ name: label, dataset1: val, dataset2: val }]
  const chartData = data.labels.map((label, i) => {
    const point = { name: label };
    data.datasets.forEach((ds) => {
      point[ds.label] = ds.values[i] || 0;
    });
    return point;
  });

  return (
    <div className="rounded-xl bg-steel-700 border border-steel-600/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-steel-600/40">
        <p className="text-xs font-semibold text-paper-100/80">{title}</p>
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-steel-600)" opacity={0.4} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }}
              axisLine={{ stroke: 'var(--color-steel-600)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-paper-100)', fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {data.datasets.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                formatter={(value) => <span style={{ color: 'var(--color-paper-100)', opacity: 0.6 }}>{value}</span>}
              />
            )}
            {data.datasets.map((ds) => (
              <Line
                key={ds.label}
                type="monotone"
                dataKey={ds.label}
                stroke={ds.color || 'var(--color-phosphor-500)'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
