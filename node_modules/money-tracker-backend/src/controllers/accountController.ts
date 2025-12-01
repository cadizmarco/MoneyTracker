import { Request, Response } from 'express';
import Account from '../models/Account';
import { accountCreateSchema, accountUpdateSchema } from '../validation/account';
import { AuthRequest } from '../types/auth';

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const accounts = await Account.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }
    res.json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = accountCreateSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }
    const userId = req.user?.userId;
    const account = new Account({ ...req.body, userId });
    await account.save();
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = accountUpdateSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }
    const userId = req.user?.userId;
    const account = await Account.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }
    res.json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const account = await Account.findOneAndDelete({ _id: id, userId });
    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};