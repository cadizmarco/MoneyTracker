import { Response } from 'express';
import Transaction from '../models/Transaction';
import Account from '../models/Account';
import Budget from '../models/Budget';
import { AuthRequest } from '../types/auth';

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const totalAccounts = await Account.countDocuments({ userId });
    const totalBalance = await Account.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const monthlyIncome = await Transaction.aggregate([
      { $match: { userId, type: 'income', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyExpenses = await Transaction.aggregate([
      { $match: { userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalBudgets = await Budget.countDocuments({ userId });
    const exceededBudgets = await Budget.countDocuments({ userId, spent: { $gt: '$amount' } });

    res.json({
      success: true,
      data: {
        totalAccounts,
        totalBalance: totalBalance.length > 0 ? totalBalance[0].total : 0,
        monthlyIncome: monthlyIncome.length > 0 ? monthlyIncome[0].total : 0,
        monthlyExpenses: monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0,
        totalBudgets,
        exceededBudgets
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};