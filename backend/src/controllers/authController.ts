import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key';
// Normalize expiresIn to the exact type jsonwebtoken expects
const expiresInEnv = process.env.JWT_EXPIRE;
const normalizedExpiresIn =
  expiresInEnv && /^\d+$/.test(expiresInEnv) ? Number(expiresInEnv) : (expiresInEnv || '7d');
// Cast to SignOptions['expiresIn'] to satisfy library typing variations
const JWT_OPTIONS: SignOptions = { expiresIn: normalizedExpiresIn as unknown as SignOptions['expiresIn'] };

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already in use' });
      return;
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, JWT_OPTIONS);
    res.status(201).json({ success: true, data: { user: { id: user._id.toString(), name: user.name, email: user.email }, token } });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, JWT_OPTIONS);
    res.json({ success: true, data: { user: { id: user._id.toString(), name: user.name, email: user.email }, token } });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: { user } });
    return;
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
};