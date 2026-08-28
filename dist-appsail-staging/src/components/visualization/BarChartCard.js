'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#4A8B6F', '#D97706', '#B91C1C', '#3F7A5C', '#9C2B2B', '#2E6B4C'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-steel-700 border border-steel-600/40 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-paper-100/60">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold text-paper-100">
            {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChartCard({ data, title }) {
  if (!data || !data.labels || !data.values || data.labels.length === 0) {
    return (
      <div className="rounded-xl bg-steel-700 border border-steel-600/40 p-4">
        <p className="text-xs text-paper-100/70 font-semibold mb-3">{title}</p>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-paper-100/40">No data available</p>
        </div>
      </div>
    );
  }

  const chartData = data.labels.map((label, i) => ({
    name: label,
    value: data.values[i] || 0,
  }));

  return (
    <div className="rounded-xl bg-steel-700 border border-steel-600/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-steel-600/40">
        <p className="text-xs font-semibold text-paper-100/80">{title}</p>
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={data.colors ? data.colors[i] : COLORS[i % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
