import React from 'react';

interface Props {
  currentDate: Date;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  transactionsByDate: Record<string, any[]>;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

const toLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function MonthView({ currentDate, selectedDate, onSelect, transactionsByDate }: Props) {
  const first = startOfMonth(currentDate);
  const startWeekDay = first.getDay();
  // fill 6 rows * 7 = 42 cells
  const days: { date: Date; inMonth: boolean }[] = [];
  // determine starting date (may be from previous month)
  const startDate = new Date(first);
  startDate.setDate(first.getDate() - startWeekDay);

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push({ date: d, inMonth: d.getMonth() === currentDate.getMonth() });
  }

  const today = toLocalYMD(new Date());

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(({ date, inMonth }) => {
          const key = toLocalYMD(date);
          const isToday = key === today;
          const isSelected = selectedDate && toLocalYMD(selectedDate) === key;
          const hasTx = !!transactionsByDate[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(new Date(date.getFullYear(), date.getMonth(), date.getDate()))}
              className={`p-3 h-20 flex flex-col justify-between border rounded-md text-left hover:shadow-sm transition-colors ${inMonth ? 'bg-white' : 'text-muted-foreground bg-gray-50'} ${isSelected ? 'ring-2 ring-violet-500 border-transparent' : 'border-gray-200'} ${isToday ? 'outline outline-1 outline-sky-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="text-sm font-medium">{date.getDate()}</div>
                {hasTx && <div className="h-2 w-2 rounded-full bg-emerald-500 mt-0.5" />}
              </div>
              <div className="text-xs text-muted-foreground">&nbsp;</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
