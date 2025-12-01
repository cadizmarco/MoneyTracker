import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getAuthToken, getCurrentUser } from '@/lib/storage';
import { createTransaction as createTransactionApi, getAccounts as getAccountsApi } from '@/lib/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string; // YYYY-MM-DD
  onCreated?: () => void;
};

const AddTransactionDialog: React.FC<Props> = ({ open, onOpenChange, initialDate, onCreated }) => {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    accountId: '',
    date: initialDate || (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })(),
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // load accounts once
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    (async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const res = await getAccountsApi(token);
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map((a: any) => ({ id: a._id, name: a.name }));
          setAccounts(mapped);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (initialDate) {
      setFormData((prev) => ({ ...prev, date: initialDate }));
    }
  }, [initialDate]);

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleCreate = async () => {
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to create transactions' });
      return;
    }
    const token = getAuthToken();
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Missing auth token' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category || (selectedCategory === 'Others' ? (customCategory.trim() || 'Others') : ''),
        description: formData.description,
        date: formData.date,
      };
      const res = await createTransactionApi(token, payload);
      if (res.success) {
        toast({ title: 'Transaction added', description: 'Saved successfully' });
        onOpenChange(false);
        onCreated && onCreated();
        // reset form
        setFormData({ type: 'expense', amount: '', category: '', description: '', accountId: '', date: new Date().toISOString().slice(0, 10) });
        setSelectedCategory('');
        setShowCustomCategory(false);
        setCustomCategory('');
      } else {
        toast({ title: 'Failed', description: res.message || 'Failed to create transaction' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to create transaction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
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
            <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={(v) => {
              setSelectedCategory(v);
              if (v !== 'Others') {
                setFormData({ ...formData, category: v });
                setShowCustomCategory(false);
                setCustomCategory('');
              } else {
                setShowCustomCategory(true);
                setCustomCategory('');
                setFormData({ ...formData, category: '' });
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory === 'Others' && (
              <div className="pt-2">
                <Input autoFocus placeholder="Enter category" value={customCategory} onChange={(e) => { const v = e.target.value; setCustomCategory(v); setFormData({ ...formData, category: v }); }} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" className="w-full" disabled={isSubmitting}>Add Transaction</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to add this transaction?</AlertDialogTitle>
                <AlertDialogDescription>This will create a new transaction with the details you entered.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleCreate()}>
                  Yes, add transaction
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
