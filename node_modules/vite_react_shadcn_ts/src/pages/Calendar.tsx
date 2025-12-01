import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AddTransactionDialog from '@/components/transactions/AddTransactionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CalendarHeader from '@/components/calendar/Header';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayView from '@/components/calendar/DayView';
import { getCurrentUser } from '@/lib/storage';
import { getTransactions as getTransactionsApi } from '@/lib/api';

type ViewMode = 'monthly' | 'weekly' | 'daily';

const toLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const normalizeLocal = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const CalendarPage = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [view, setView] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState<Date>(normalizeLocal(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(normalizeLocal(new Date()));
  const [transactions, setTransactions] = useState<any[]>([]);
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addInitialDate, setAddInitialDate] = useState<string | undefined>(undefined);

  const loadTransactions = useCallback(async () => {
    const token = localStorage.getItem('moneytracker_auth_token');
    if (!user || !token) {
      navigate('/login');
      return;
    }
    try {
      const res = await getTransactionsApi(token);
      if (res.success && Array.isArray(res.data)) {
        setTransactions(res.data.map((t: any) => ({ ...t, date: toLocalYMD(new Date(t.date)) })));
      }
    } catch (e) {
      // ignore
    }
  }, [navigate, user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const transactionsByDate = useMemo(() => {
    return transactions.reduce<Record<string, any[]>>((acc, tx) => {
      const key = tx.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    }, {});
  }, [transactions]);

  // compute visible range for weekly/monthly
  const range = useMemo(() => {
    if (view === 'daily') {
      const s = toLocalYMD(currentDate);
      return { start: s, end: s };
    }
    if (view === 'weekly') {
      const d = normalizeLocal(currentDate);
      const day = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start: toLocalYMD(start), end: toLocalYMD(end) };
    }
    const d = normalizeLocal(currentDate);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start: toLocalYMD(start), end: toLocalYMD(end) };
  }, [currentDate, view]);

  const prev = () => {
    if (view === 'daily') setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
    else if (view === 'weekly') setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const next = () => {
    if (view === 'daily') setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
    else if (view === 'weekly') setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };
  const goToday = () => {
    const now = normalizeLocal(new Date());
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const onSelectDate = (d?: Date) => {
    if (!d) return;
    const norm = normalizeLocal(d);
    setSelectedDate(norm);
    setCurrentDate(norm);
    // Open add dialog with the clicked date prefilled
    const date = toLocalYMD(norm);
    setAddInitialDate(date);
    setIsAddOpen(true);
    try {
      toast({ title: 'Prefilled', description: `Date prefilled to ${date}` });
    } catch (e) {
      // ignore
    }
  };

  const visibleTx = useMemo(() => {
    const start = new Date(range.start + 'T00:00:00');
    const end = new Date(range.end + 'T23:59:59');
    const results: any[] = [];
    Object.entries(transactionsByDate).forEach(([k, arr]) => {
      const dt = new Date(k + 'T00:00:00');
      if (dt >= start && dt <= end) results.push(...arr);
    });
    return results.sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [range, transactionsByDate]);

  const title = view === 'monthly' ? `${currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}` : view === 'weekly' ? `Week of ${new Date(range.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : `Day: ${toLocalYMD(currentDate)}`;

  return (
    <div className="space-y-6">
      <CalendarHeader view={view === 'monthly' ? 'monthly' : view === 'weekly' ? 'weekly' : 'daily'} onViewChange={(v) => setView(v as any)} onPrev={prev} onNext={next} onToday={goToday} title={title} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {view === 'monthly' && (
              <MonthView currentDate={currentDate} selectedDate={selectedDate} onSelect={onSelectDate} transactionsByDate={transactionsByDate} />
            )}

            {view === 'weekly' && (
              <WeekView currentDate={currentDate} selectedDate={selectedDate} onSelect={onSelectDate} transactionsByDate={transactionsByDate} />
            )}

            {view === 'daily' && selectedDate && (
              <DayView date={selectedDate} transactions={transactionsByDate[toLocalYMD(selectedDate)] || []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events / Transactions ({visibleTx.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {visibleTx.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in range.</p>
            ) : (
              <div className="space-y-2">
                {visibleTx.map((tx) => (
                  <div key={tx._id || tx.id || Math.random()} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{tx.category}</div>
                      <div className="text-sm text-muted-foreground">{tx.date} • {tx.description}</div>
                    </div>
                    <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{(tx.type === 'income' ? '+' : '-')}{tx.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Mobile FAB to add transaction for selected date (opens modal) */}
      <div className="fixed right-4 bottom-6 md:hidden">
        <button
          onClick={() => {
            const date = selectedDate ? toLocalYMD(selectedDate) : toLocalYMD(currentDate);
            setAddInitialDate(date);
            setIsAddOpen(true);
            try {
              toast({ title: 'Prefilled', description: `Date prefilled to ${date}` });
            } catch (e) {
              // ignore
            }
          }}
          className="bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Add transaction"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <AddTransactionDialog
        open={isAddOpen}
        onOpenChange={(v) => setIsAddOpen(v)}
        initialDate={addInitialDate}
        onCreated={() => {
          // reload transactions so calendar highlights update
          loadTransactions();
        }}
      />
    </div>
  );
};

export default CalendarPage;
