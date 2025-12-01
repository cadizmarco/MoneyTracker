import React from 'react';

interface Props {
  currentDate: Date;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  transactionsByDate: Record<string, any[]>;
}

const toLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function startOfWeek(d: Date) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = r.getDay();
  r.setDate(r.getDate() - day);
  return r;
}

export default function WeekView({ currentDate, selectedDate, onSelect, transactionsByDate }: Props) {
  const start = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }).map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));

  const weekLabel = `Week of ${currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">{weekLabel}</div>
      <div className="flex gap-3 overflow-x-auto">
        {days.map((d) => {
          const key = toLocalYMD(d);
          const isSelected = selectedDate && toLocalYMD(selectedDate) === key;
          const hasTx = !!transactionsByDate[key];
          return (
            <button key={key} onClick={() => onSelect(new Date(d.getFullYear(), d.getMonth(), d.getDate()))} className={`min-w-[110px] p-3 border rounded-md text-left ${isSelected ? 'bg-violet-600 text-white' : 'bg-white'} hover:shadow-sm`}>
              <div className="text-xs text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div className="text-lg font-semibold">{d.getDate()}</div>
              {hasTx && <div className={`h-2 w-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'} mt-2`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
