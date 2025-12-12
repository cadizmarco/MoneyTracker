import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types/auth';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('_id');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    req.user = { userId: user._id.toString() };
    next();
    return;
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }
};