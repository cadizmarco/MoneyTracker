import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser, getAuthToken } from '@/lib/storage';
import { getBudgets as getBudgetsApi, createBudget as createBudgetApi, deleteBudgetApi, getTransactions as getTransactionsApi } from '@/lib/api';
import { Budget, EXPENSE_CATEGORIES } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const Budgets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly',
  });
  const hasLoadedRef = useRef(false);
  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);

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
      const [budgetsRes, txRes] = await Promise.all([
        getBudgetsApi(token),
        getTransactionsApi(token),
      ]);
      if (budgetsRes.success && Array.isArray(budgetsRes.data)) {
        const mappedBudgets = budgetsRes.data.map(b => ({
          id: b._id,
          userId: b.userId,
          category: b.category,
          amount: Number(b.amount),
          period: b.period as 'monthly' | 'yearly',
          startDate: b.startDate || new Date().toISOString(),
          createdAt: b.createdAt || new Date().toISOString(),
          spent: b.spent || 0,
        }));
        setBudgets(mappedBudgets);
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
          date: new Date(t.date).toISOString().split('T')[0],
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
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: new Date().toISOString(),
      };
      const res = await createBudgetApi(token, payload);
      if (res.success && res.data) {
        toastRef.current({
          title: 'Budget created',
          description: 'Your budget has been set',
        });
        setIsDialogOpen(false);
        setFormData({ category: '', amount: '', period: 'monthly' });
        loadData();
      } else {
        toastRef.current({ title: 'Failed to create budget', description: res.message || 'Unknown error' });
      }
    } catch (e: any) {
      toastRef.current({ title: 'Error', description: e?.message || 'Failed to create budget' });
    }
  };

  const handleDelete = async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await deleteBudgetApi(token, id);
      if (res.success) {
        toastRef.current({
          title: 'Budget deleted',
          description: 'The budget has been removed',
        });
        loadData();
      } else {
        toastRef.current({ title: 'Failed to delete budget', description: res.message || 'Unknown error' });
      }
    } catch (e: any) {
      toastRef.current({ title: 'Error', description: e?.message || 'Failed to delete budget' });
    }
  };

  const getSpentAmount = (budget: Budget) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        const matchesPeriod = budget.period === 'monthly'
          ? date.getMonth() === currentMonth && date.getFullYear() === currentYear
          : date.getFullYear() === currentYear;
        return t.type === 'expense' && t.category === budget.category && matchesPeriod;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Budgets</h2>
          <p className="text-muted-foreground">Set and track your spending limits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={formData.period} onValueChange={(value: any) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="w-full">Create Budget</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to create this budget?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will add a new budget with the selected category and amount.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        handleSubmit(e as any);
                      }}
                    >
                      Yes, create budget
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No budgets yet. Create your first budget!</p>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const spent = getSpentAmount(budget);
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = spent > budget.amount;

            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{budget.category}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {budget.period} budget
                      </p>
                    </div>
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
                          <AlertDialogTitle>Are you sure you want to delete this budget?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone and will remove the budget from your list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(budget.id)}>
                            Yes, delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className={isOverBudget ? 'text-destructive font-medium' : ''}>
                      {formatCurrency(spent)}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className={`text-lg font-bold ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-lg font-bold">{formatCurrency(budget.amount)}</p>
                    </div>
                  </div>
                  {isOverBudget && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                      ⚠️ You've exceeded this budget by {formatCurrency(Math.abs(remaining))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Budgets;
