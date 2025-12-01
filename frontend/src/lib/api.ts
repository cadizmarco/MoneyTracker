// Lightweight API client for backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type ApiResult<T> = { success: boolean; data?: T; message?: string };

export async function login(email: string, password: string): Promise<ApiResult<{ token: string; user: { id: string; name: string; email: string } }>> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return json;
}

export async function register(name: string, email: string, password: string): Promise<ApiResult<{ token: string; user: { id: string; name: string; email: string } }>> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  return json;
}

export async function getMe(token: string): Promise<ApiResult<{ user: { id: string; name: string; email: string } }>> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}

// Accounts API
export type ApiAccount = {
  _id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other';
  balance: number;
  currency: string;
  createdAt?: string;
};

export async function getAccounts(token: string): Promise<ApiResult<ApiAccount[]>> {
  const res = await fetch(`${BASE_URL}/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}

export async function createAccount(
  token: string,
  payload: { name: string; type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other'; balance: number; currency?: string }
): Promise<ApiResult<ApiAccount>> {
  const res = await fetch(`${BASE_URL}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json;
}

export async function deleteAccountApi(token: string, id: string): Promise<ApiResult<{ message: string }>> {
  const res = await fetch(`${BASE_URL}/accounts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}

// Transactions API
export type ApiTransaction = {
  _id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description?: string;
  date: string;
  tags?: string[];
  transferToAccountId?: string;
};

export async function getTransactions(
  token: string,
  params?: { accountId?: string; startDate?: string; endDate?: string; category?: string; type?: 'income' | 'expense' | 'transfer' }
): Promise<ApiResult<ApiTransaction[]>> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
  }
  const res = await fetch(`${BASE_URL}/transactions${query.toString() ? `?${query.toString()}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}

export async function createTransaction(
  token: string,
  payload: { accountId: string; amount: number; type: 'income' | 'expense'; category: string; description?: string; date?: string }
): Promise<ApiResult<ApiTransaction>> {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json;
}

export async function deleteTransactionApi(token: string, id: string): Promise<ApiResult<{ message: string }>> {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}

// Budgets API
export type ApiBudget = {
  _id: string;
  userId: string;
  name?: string;
  category: string;
  amount: number;
  spent?: number;
  period: 'monthly' | 'weekly' | 'yearly' | 'custom';
  startDate: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function getBudgets(token: string): Promise<ApiResult<ApiBudget[]>> {
  const res = await fetch(`${BASE_URL}/budgets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}

export async function createBudget(
  token: string,
  payload: { category: string; amount: number; period: 'monthly' | 'yearly'; startDate?: string }
): Promise<ApiResult<ApiBudget>> {
  const res = await fetch(`${BASE_URL}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json;
}

export async function deleteBudgetApi(token: string, id: string): Promise<ApiResult<{ message: string }>> {
  const res = await fetch(`${BASE_URL}/budgets/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}