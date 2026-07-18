'use client';

const TYPE_COLORS = {
  fir: 'var(--color-phosphor-500)',
  arrest: 'var(--color-critical-500)',
  chargesheet: 'var(--color-warn-500)',
  court: 'var(--color-success-500)',
  default: 'var(--color-steel-600)',
};

export default function TimelineCard({ data, title }) {
  if (!data || !data.events || data.events.length === 0) {
    return (
      <div className="rounded-xl bg-steel-700 border border-steel-600/40 p-4">
        <p className="text-xs text-paper-100/70 font-semibold mb-3">{title}</p>
        <div className="h-24 flex items-center justify-center">
          <p className="text-xs text-paper-100/40">No timeline events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-steel-700 border border-steel-600/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-steel-600/40">
        <p className="text-xs font-semibold text-paper-100/80">{title}</p>
      </div>
      <div className="p-4 max-h-72 overflow-y-auto space-y-0">
        {data.events.map((event, i) => {
          const dotColor = TYPE_COLORS[event.type] || TYPE_COLORS.default;
          const isLast = i === data.events.length - 1;
          return (
            <div key={i} className="flex gap-4 relative">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-steel-600/40"
                  style={{ zIndex: 0 }}
                />
              )}
              {/* Dot */}
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1 z-10 ring-2 ring-steel-700"
                style={{ backgroundColor: dotColor }}
              />
              {/* Content */}
              <div className={`pb-5 flex-1 ${isLast ? 'pb-0' : ''}`}>
                <p className="text-sm font-medium text-paper-100/90 leading-snug">{event.title}</p>
                <p className="text-[10px] text-paper-100/50 font-mono mt-0.5">{event.date}</p>
                {event.description && (
                  <p className="text-xs text-paper-100/50 mt-1 leading-relaxed">{event.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
