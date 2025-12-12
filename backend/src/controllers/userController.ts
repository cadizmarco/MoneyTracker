import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types/auth';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body as { name: string; email: string };
    const user = await User.findByIdAndUpdate(req.user?.userId, { name, email }, { new: true, runValidators: true }).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required' });
      return;
    }
    
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      return;
    }
    
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};