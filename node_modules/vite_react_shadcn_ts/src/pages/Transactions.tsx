import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUser, getAuthToken } from '@/lib/storage';
import { getAccounts as getAccountsApi, getTransactions as getTransactionsApi, createTransaction as createTransactionApi, deleteTransactionApi } from '@/lib/api';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Transactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  // Helper to format a Date as local YYYY-MM-DD (avoids UTC offset issues from toISOString)
  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    accountId: '',
    date: toLocalYMD(new Date()),
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const hasLoadedRef = useRef(false);
  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);
  const location = useLocation();

  useEffect(() => {
    navigateRef.current = navigate;
    toastRef.current = toast;
  }, [navigate, toast]);

  const loadData = useCallback(async () => {
    const u = getCurrentUser();
    const token = getAuthToken();
    if (!u || !token) {
      navigateRef.current('/login');
      return;
    }
    try {
      const [accRes, txRes] = await Promise.all([
        getAccountsApi(token),
        getTransactionsApi(token),
      ]);
      if (accRes.success && Array.isArray(accRes.data)) {
        const mappedAcc = accRes.data.map(a => ({
          id: a._id,
          userId: a.userId,
          name: a.name,
          type: a.type as any,
          balance: Number(a.balance),
          currency: a.currency,
          createdAt: a.createdAt || new Date().toISOString(),
        }));
        setAccounts(mappedAcc);
      }
      if (txRes.success && Array.isArray(txRes.data)) {
        const mappedTx = txRes.data.map(t => ({
          id: t._id,
          userId: t.userId,
          accountId: t.accountId,
          amount: Number(t.amount),
          type: t.type as any,
          category: t.category,
          description: t.description || '',
          date: toLocalYMD(new Date(t.date)),
          createdAt: new Date().toISOString(),
        }));
        setTransactions(mappedTx);
      }
    } catch (e: any) {
      toastRef.current({ title: 'Error', description: e?.message || 'Failed to load data' });
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
    // Open add dialog automatically when navigated with ?add=true (mobile FAB)
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('add') === 'true') {
        const dateParam = params.get('date');
        if (dateParam) {
          setFormData((prev) => ({ ...prev, date: dateParam }));
        }
        setIsDialogOpen(true);
        // remove query params from URL without reloading
        params.delete('add');
        params.delete('date');
        const newSearch = params.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, '', newPath);
      }
    } catch (e) {
      // ignore
    }
  }, [user, loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const payload = {
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category || (selectedCategory === 'Others' ? (customCategory.trim() || 'Others') : ''),
        description: formData.description,
        // If we're in calendar view and a date is selected, enforce that date so transactions
        // created from the calendar are always saved to that day (do not allow saving to another day).
        date: view === 'calendar' && selectedDate ? toLocalYMD(selectedDate) : formData.date,
      } as any;
      const res = await createTransactionApi(token, payload);
      if (res.success && res.data) {
        toast({ title: 'Transaction added', description: 'Your transaction has been recorded' });
        setIsDialogOpen(false);
        // Wait for transaction to be saved, then reload transactions so calendar highlights update
        await loadData();
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          accountId: '',
          date: toLocalYMD(new Date()),
        });
        setSelectedCategory('');
        setShowCustomCategory(false);
        setCustomCategory('');
      } else {
        toast({ title: 'Failed to add transaction', description: res.message || 'Unknown error' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to add transaction' });
    }
  };

  const handleDelete = async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await deleteTransactionApi(token, id);
      if (res.success) {
        toast({ title: 'Transaction deleted', description: 'The transaction has been removed' });
        loadData();
      } else {
        toast({ title: 'Failed to delete transaction', description: res.message || 'Unknown error' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to delete transaction' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const transactionsByDate = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = tx.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const handleSelectDate = async (date: Date | undefined) => {
    if (!date) return;
    // Normalize to local midnight (year, month, day) to avoid timezone offsets
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(normalized);
    const iso = toLocalYMD(normalized);
    setFormData((prev) => ({ ...prev, date: iso }));
    // Fetch latest transactions for the clicked date
    await loadData();
    // When in calendar view, clicking a day should feel like "add transaction on this day"
    setIsDialogOpen(true);
  };

  const getTransactionsForSelectedDate = () => {
    if (!selectedDate) return [];
    const key = toLocalYMD(selectedDate);
    return transactionsByDate[key] || [];
  };

  const getSelectedDateSummary = () => {
    const txs = getTransactionsForSelectedDate();
    return txs.reduce(
      (acc, tx) => {
        if (tx.type === 'income') {
          acc.income += tx.amount;
        } else if (tx.type === 'expense') {
          acc.expense += tx.amount;
        }
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account</Label>
                <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    if (value !== 'Others') {
                      setFormData({ ...formData, category: value });
                      setShowCustomCategory(false);
                      setCustomCategory('');
                    } else {
                      setShowCustomCategory(true);
                      setCustomCategory('');
                      setFormData({ ...formData, category: '' });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory === 'Others' && (
                  <div className="space-y-2 pt-2">
                    <Input
                      autoFocus
                      placeholder="Enter category"
                      value={customCategory}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCustomCategory(v);
                        setFormData({ ...formData, category: v });
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={view === 'calendar' && selectedDate ? toLocalYMD(selectedDate) : formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  // When in calendar view and a date is selected, lock the date input so the
                  // transaction is saved to that highlighted day only.
                  disabled={view === 'calendar' && !!selectedDate}
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="w-full">
                    Add Transaction
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to add this transaction?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create a new transaction with the details you entered.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        handleSubmit(e as any);
                      }}
                    >
                      Yes, add transaction
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={view} onValueChange={(v) => {
          if (v === 'calendar') {
            navigate('/calendar');
            return;
          }
          setView(v as 'list' | 'calendar');
        }}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transactions yet. Add your first transaction!</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.category}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this transaction?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone and will remove the transaction from your records.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleSelectDate}
                  modifiers={{
                    // Parse YYYY-MM-DD strings into local dates to avoid timezone parsing issues
                    hasTx: Object.keys(transactionsByDate).map((d) => {
                      const [y, m, day] = d.split('-');
                      return new Date(Number(y), Number(m) - 1, Number(day));
                    }),
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? `Transactions on ${selectedDate.toLocaleDateString()}`
                    : 'Transactions on selected day'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getTransactionsForSelectedDate().length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No transactions on this day. Use “Add Transaction” to create one.
                  </p>
                ) : (
                  <>
                    {(() => {
                      const { income, expense, net } = getSelectedDateSummary();
                      return (
                        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3 text-xs sm:text-sm">
                          <div>
                            <p className="text-muted-foreground">Income</p>
                            <p className="font-semibold text-green-600">{formatCurrency(income)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expenses</p>
                            <p className="font-semibold text-red-600">{formatCurrency(expense)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net</p>
                            <p
                              className={`font-semibold ${
                                net >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatCurrency(net)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {getTransactionsForSelectedDate().map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{transaction.category}</p>
                            {transaction.description && (
                              <p className="text-xs text-muted-foreground">{transaction.description}</p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transactions;
