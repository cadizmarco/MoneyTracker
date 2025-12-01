import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type ViewMode = 'monthly' | 'weekly' | 'daily';

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  title: string;
}

export default function CalendarHeader({ view, onViewChange, onPrev, onNext, onToday, title }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">View your events and transactions</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onPrev}><ChevronLeft className="w-4 h-4"/></Button>
          <Button variant="outline" size="sm" onClick={onToday}>Today</Button>
          <Button variant="outline" size="sm" onClick={onNext}><ChevronRight className="w-4 h-4"/></Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={view === 'daily' ? 'default' : 'ghost' as any} size="sm" onClick={() => onViewChange('daily')}>Daily</Button>
          <Button variant={view === 'weekly' ? 'default' : 'ghost' as any} size="sm" onClick={() => onViewChange('weekly')}>Weekly</Button>
          <Button variant={view === 'monthly' ? 'default' : 'ghost' as any} size="sm" onClick={() => onViewChange('monthly')}>Monthly</Button>
        </div>
      </div>
    </div>
  );
}
