import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ITransaction extends Document {
  user: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  account: string;
  date: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccount extends Document {
  user: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudget extends Document {
  user: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

