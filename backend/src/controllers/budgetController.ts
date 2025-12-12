import { Response } from 'express';
import Budget from '../models/Budget';
import Transaction from '../models/Transaction';
import { budgetCreateSchema, budgetUpdateSchema } from '../validation/budget';
import { AuthRequest } from '../types/auth';

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const budgets = await Budget.find({ userId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = budgetCreateSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }
    const userId = req.user?.userId;
    const existing = await Budget.findOne({ category: req.body.category, userId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Budget for this category already exists' });
      return;
    }
    const budget = new Budget({ ...req.body, userId });
    await budget.save();
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = budgetUpdateSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }
    const userId = req.user?.userId;
    const budget = await Budget.findOneAndUpdate({ _id: id, userId }, req.body, { new: true, runValidators: true });
    if (!budget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const budget = await Budget.findOneAndDelete({ _id: id, userId });
    if (!budget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateBudgetSpent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const spent = await Transaction.aggregate([
      { $match: { userId, category: budget.category, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    budget.spent = spent.length > 0 ? spent[0].total : 0;
    await budget.save();
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};