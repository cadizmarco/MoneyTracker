import React, { useEffect, useMemo, useRef } from 'react';

interface Props {
  date: Date;
  transactions: any[]; // transactions for the date
}

const toLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function timeToTopMinutes(h: number, m: number, hourHeight = 60) {
  return h * hourHeight + (m / 60) * hourHeight;
}

export default function DayView({ date, transactions }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hourHeight = 60; // px per hour

  // map transactions to positions (if they have time)
  const events = useMemo(() => {
    return (transactions || []).map((tx) => {
      // expect tx.date may be YYYY-MM-DD or with time
      const dt = new Date(tx.date);
      const hrs = dt.getHours();
      const mins = dt.getMinutes();
      const top = timeToTopMinutes(hrs, mins, hourHeight);
      return { tx, top };
    });
  }, [transactions]);

  useEffect(() => {
    // scroll to current hour approx
    if (!containerRef.current) return;
    const now = new Date();
    if (toLocalYMD(now) === toLocalYMD(date)) {
      const top = timeToTopMinutes(now.getHours(), now.getMinutes(), hourHeight) - 120;
      containerRef.current.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }, [date]);

  const now = new Date();
  const showNow = toLocalYMD(now) === toLocalYMD(date);
  const nowTop = timeToTopMinutes(now.getHours(), now.getMinutes(), hourHeight);

  return (
    <div className="relative border rounded-md bg-white overflow-auto" style={{ maxHeight: 600 }} ref={containerRef}>
      <div className="relative">
        {[...Array(24)].map((_, h) => (
          <div key={h} className="flex border-b border-dashed border-gray-100" style={{ height: hourHeight }}>
            <div className="w-16 text-xs text-muted-foreground flex items-start pt-1 px-2">{String(h).padStart(2, '0')}:00</div>
            <div className="flex-1 px-2">
              <div className="h-full" />
            </div>
          </div>
        ))}

        {showNow && (
          <div className="absolute left-16 right-0 pointer-events-none" style={{ top: nowTop }}>
            <div className="relative">
              <div className="absolute left-0 right-0 h-[2px] bg-red-500" />
              <div className="absolute -left-3 -top-1 text-xs text-red-500 font-medium">Now</div>
            </div>
          </div>
        )}

        {events.map(({ tx, top }, i) => (
          <div key={i} className="absolute left-20 right-4 bg-violet-50 border border-violet-200 rounded px-2 py-1 text-sm" style={{ top }}>
            <div className="font-medium">{tx.category || 'Transaction'}</div>
            <div className="text-xs text-muted-foreground">{tx.description || ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
