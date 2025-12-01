import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Account from '../models/Account';
import { transactionCreateSchema, transactionUpdateSchema } from '../validation/transaction';
import { AuthRequest } from '../types/auth';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { accountId, startDate, endDate, category, type } = req.query as any;
    const filter: any = { userId };
    if (accountId) filter.accountId = accountId;
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const transactions = await Transaction.find(filter)
      .populate('accountId', 'name type currency')
      .sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const transaction = await Transaction.findOne({ _id: id, userId }).populate('accountId', 'name type currency');
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = transactionCreateSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }
    const userId = req.user?.userId;
    const account = await Account.findOne({ _id: req.body.accountId, userId });
    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }
    const transaction = new Transaction({ ...req.body, userId });
    await transaction.save();
    await transaction.populate('accountId', 'name type currency');
    const amount = Number(transaction.amount);
    const balanceChange = transaction.type === 'income' ? amount : -amount;
    await Account.findByIdAndUpdate(req.body.accountId, { $inc: { balance: balanceChange } });
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = transactionUpdateSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }
    const userId = req.user?.userId;
    const existing = await Transaction.findOne({ _id: id, userId });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }
    const oldAmount = Number(existing.amount);
    const oldBalanceChange = existing.type === 'income' ? oldAmount : -oldAmount;
    await Account.findByIdAndUpdate(existing.accountId, { $inc: { balance: -oldBalanceChange } });
    const transaction = await Transaction.findOneAndUpdate({ _id: id, userId }, req.body, { new: true, runValidators: true });
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }
    await transaction.populate('accountId', 'name type currency');
    const newAmount = Number(transaction.amount);
    const newBalanceChange = transaction.type === 'income' ? newAmount : -newAmount;
    await Account.findByIdAndUpdate(transaction.accountId, { $inc: { balance: newBalanceChange } });
    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }
    const amount = Number(transaction.amount);
    const balanceChange = transaction.type === 'income' ? amount : -amount;
    await Account.findByIdAndUpdate(transaction.accountId, { $inc: { balance: -balanceChange } });
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};