import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUser, getAuthToken } from '@/lib/storage';
import { getAccounts as getAccountsApi, createAccount as createAccountApi, deleteAccountApi } from '@/lib/api';
import { Account } from '@/lib/types';
import { Plus, Trash2, Wallet, CreditCard, Banknote, Smartphone } from 'lucide-react';
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

const Accounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other',
    balance: '',
  });
  const hasLoadedRef = useRef(false);
  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);

  useEffect(() => {
    navigateRef.current = navigate;
    toastRef.current = toast;
  }, [navigate, toast]);

  const loadAccounts = useCallback(async () => {
    const user = getCurrentUser();
    const token = getAuthToken();
    if (!user || !token) {
      navigateRef.current('/login');
      return;
    }
    try {
      const res = await getAccountsApi(token);
      if (res.success && Array.isArray(res.data)) {
        // Map API accounts to frontend Account type
        const mapped = res.data.map(a => ({
          id: a._id,
          userId: a.userId,
          name: a.name,
          type: a.type,
          balance: Number(a.balance),
          currency: a.currency,
          createdAt: a.createdAt || new Date().toISOString(),
        })) as Account[];
        setAccounts(mapped);
      } else {
        toastRef.current({ title: 'Failed to load accounts', description: res.message || 'Unknown error' });
      }
    } catch (e: any) {
      toastRef.current({ title: 'Error', description: e?.message || 'Failed to load accounts' });
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadAccounts();
    }
    const handleUpdate = (event: CustomEvent) => {
      const keys = (event.detail as { keys: string[] })?.keys || [];
      if (keys.includes('moneytracker_accounts')) {
        loadAccounts();
      }
    };
    window.addEventListener('moneytracker:data-updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('moneytracker:data-updated', handleUpdate as EventListener);
    };
  }, [user, loadAccounts]);

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
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        currency: (user.currency || 'USD').toUpperCase(),
      };
      const res = await createAccountApi(token, payload);
      if (res.success && res.data) {
        toast({ title: 'Account created', description: 'Your account has been added' });
        setIsDialogOpen(false);
        setFormData({ name: '', type: 'cash', balance: '' });
        loadAccounts();
      } else {
        toast({ title: 'Failed to create account', description: res.message || 'Unknown error' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to create account' });
    }
  };

  const handleDelete = async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await deleteAccountApi(token, id);
      if (res.success) {
        toast({ title: 'Account deleted', description: 'The account has been removed' });
        loadAccounts();
      } else {
        toast({ title: 'Failed to delete account', description: res.message || 'Unknown error' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to delete account' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Banknote className="w-5 h-5" />;
      case 'checking':
      case 'savings':
        return <Wallet className="w-5 h-5" />;
      case 'credit':
        return <CreditCard className="w-5 h-5" />;
      case 'investment':
      case 'other':
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Accounts</h2>
          <p className="text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  placeholder="e.g., Main Wallet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={formData.type} onValueChange={(value: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Balance</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="w-full">
                    Add Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to add this account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create a new account with the details you entered.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        // Submit the form after confirmation
                        handleSubmit(e as any);
                      }}
                    >
                      Yes, add account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-muted-foreground mt-2">Across {accounts.length} accounts</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No accounts yet. Add your first account!</p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {account.type.replace('-', ' ')}
                      </p>
                    </div>
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
                        <AlertDialogTitle>Are you sure you want to delete this account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone and will remove the account from your list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(account.id)}>
                          Yes, delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Accounts;
