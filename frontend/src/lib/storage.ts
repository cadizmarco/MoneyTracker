import { User, Account, Transaction, Budget } from './types';

const STORAGE_KEYS = {
  CURRENT_USER: 'moneytracker_current_user',
  USERS: 'moneytracker_users',
  ACCOUNTS: 'moneytracker_accounts',
  TRANSACTIONS: 'moneytracker_transactions',
  BUDGETS: 'moneytracker_budgets',
  AUTH_TOKEN: 'moneytracker_auth_token',
};

// Broadcast data updates so UI can auto-refresh across pages
const DATA_UPDATED_EVENT = 'moneytracker:data-updated';
const emitDataUpdate = (keys: string[]) => {
  try {
    window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT, { detail: { keys } }));
  } catch (_) {
    // no-op (e.g., SSR)
  }
};

// User operations
export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  emitDataUpdate([STORAGE_KEYS.USERS]);
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  emitDataUpdate([STORAGE_KEYS.CURRENT_USER]);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

// Auth token operations
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  emitDataUpdate([STORAGE_KEYS.AUTH_TOKEN]);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const clearAuth = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  emitDataUpdate([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.CURRENT_USER]);
};

// Account operations
export const saveAccount = (account: Account): void => {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.id === account.id);
  if (index >= 0) {
    accounts[index] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  emitDataUpdate([STORAGE_KEYS.ACCOUNTS]);
};

export const getAccounts = (): Account[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  return data ? JSON.parse(data) : [];
};

export const getUserAccounts = (userId: string): Account[] => {
  return getAccounts().filter(a => a.userId === userId);
};

export const deleteAccount = (id: string): void => {
  const accounts = getAccounts().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  emitDataUpdate([STORAGE_KEYS.ACCOUNTS]);
};

// Transaction operations
export const saveTransaction = (transaction: Transaction): void => {
  // Current state
  const transactions = getTransactions();
  const accounts = getAccounts();
  const budgets = getBudgets();

  // Idempotency check
  const index = transactions.findIndex(t => t.id === transaction.id);
  const isNew = index < 0;

  // Affected account
  const account = accounts.find(a => a.id === transaction.accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // Sufficient funds check for expenses
  if (transaction.type === 'expense' && account.balance < transaction.amount) {
    throw new Error('Insufficient funds');
  }

  // Apply balance changes
  if (transaction.type === 'income') {
    account.balance += transaction.amount;
  } else if (transaction.type === 'expense') {
    account.balance -= transaction.amount;
  }

  // Update matching budgets for expense
  if (transaction.type === 'expense') {
    const txDate = new Date(transaction.date);
    const txMonth = txDate.getMonth();
    const txYear = txDate.getFullYear();

    const matchingBudgets = budgets.filter(b => b.userId === transaction.userId && b.category === transaction.category);

    matchingBudgets.forEach(budget => {
      const start = new Date(budget.startDate);
      const inPeriod = budget.period === 'monthly'
        ? txMonth === start.getMonth() && txYear === start.getFullYear()
        : txYear === start.getFullYear();
      if (inPeriod) {
        budget.spent = (budget.spent || 0) + transaction.amount;
      }
    });

    if (matchingBudgets.length > 0) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      emitDataUpdate([STORAGE_KEYS.BUDGETS]);
    }
  }

  // Persist transaction
  if (isNew) {
    transactions.push(transaction);
  } else {
    transactions[index] = transaction;
  }

  // Audit log
  const auditLog = {
    id: crypto.randomUUID(),
    action: isNew ? 'create_transaction' : 'update_transaction',
    entityId: transaction.id,
    userId: transaction.userId,
    timestamp: new Date().toISOString(),
    details: {
      transactionType: transaction.type,
      amount: transaction.amount,
      accountId: transaction.accountId,
      accountBalanceAfter: account.balance,
    },
  };
  const auditLogs = JSON.parse(localStorage.getItem('moneytracker_audit_logs') || '[]');
  auditLogs.push(auditLog);

  // Commit atomically
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  localStorage.setItem('moneytracker_audit_logs', JSON.stringify(auditLogs));
  emitDataUpdate([STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.ACCOUNTS]);
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const getUserTransactions = (userId: string): Transaction[] => {
  return getTransactions().filter(t => t.userId === userId);
};

export const deleteTransaction = (id: string): void => {
  // Current state
  const transactions = getTransactions();
  const accounts = getAccounts();
  const budgets = getBudgets();

  // Find transaction
  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return;
  }

  // Affected account
  const account = accounts.find(a => a.id === tx.accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // Reverse balance change
  if (tx.type === 'income') {
    account.balance -= tx.amount;
  } else if (tx.type === 'expense') {
    account.balance += tx.amount;
  }

  // Adjust budget spent for expense
  if (tx.type === 'expense') {
    const txDate = new Date(tx.date);
    const txMonth = txDate.getMonth();
    const txYear = txDate.getFullYear();
    const matchingBudgets = budgets.filter(b => b.userId === tx.userId && b.category === tx.category);
    matchingBudgets.forEach(budget => {
      const start = new Date(budget.startDate);
      const inPeriod = budget.period === 'monthly'
        ? txMonth === start.getMonth() && txYear === start.getFullYear()
        : txYear === start.getFullYear();
      if (inPeriod && budget.spent) {
        budget.spent = Math.max(0, budget.spent - tx.amount);
      }
    });
    if (matchingBudgets.length > 0) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      emitDataUpdate([STORAGE_KEYS.BUDGETS]);
    }
  }

  // Audit log
  const auditLog = {
    id: crypto.randomUUID(),
    action: 'delete_transaction',
    entityId: tx.id,
    userId: tx.userId,
    timestamp: new Date().toISOString(),
    details: {
      transactionType: tx.type,
      amount: tx.amount,
      accountId: tx.accountId,
      accountBalanceAfter: account.balance,
    },
  };
  const auditLogs = JSON.parse(localStorage.getItem('moneytracker_audit_logs') || '[]');
  auditLogs.push(auditLog);

  // Remove and commit
  const updatedTransactions = transactions.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  localStorage.setItem('moneytracker_audit_logs', JSON.stringify(auditLogs));
  emitDataUpdate([STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.ACCOUNTS]);
};

// Budget operations
export const saveBudget = (budget: Budget): void => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === budget.id);
  if (index >= 0) {
    budgets[index] = budget;
  } else {
    budgets.push(budget);
  }
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  emitDataUpdate([STORAGE_KEYS.BUDGETS]);
};

export const getBudgets = (): Budget[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  return data ? JSON.parse(data) : [];
};

export const getUserBudgets = (userId: string): Budget[] => {
  return getBudgets().filter(b => b.userId === userId);
};

export const deleteBudget = (id: string): void => {
  const budgets = getBudgets().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  emitDataUpdate([STORAGE_KEYS.BUDGETS]);
};

// Export/Import
export const exportData = (): string => {
  const data = {
    users: getUsers(),
    accounts: getAccounts(),
    transactions: getTransactions(),
    budgets: getBudgets(),
  };
  return JSON.stringify(data, null, 2);
};

// Simple CSV export focused on transactions (Excel-friendly)
export const exportTransactionsCsv = (): string => {
  const transactions = getTransactions();
  // Export CSV without internal IDs (id, userId) so imported CSV won't overwrite internal identifiers.
  const header = [
    'accountId',
    'type',
    'amount',
    'category',
    'description',
    'date',
    'createdAt',
  ];
  const rows = transactions.map((t) => [
    t.accountId,
    t.type,
    t.amount,
    t.category,
    // Escape quotes and commas in description
    t.description ? `"${String(t.description).replace(/"/g, '""') }"` : '',
    t.date,
    t.createdAt,
  ]);

  const csvLines = [
    header.join(','),
    ...rows.map((row) => row.join(',')),
  ];

  return csvLines.join('\r\n');
};

export const importData = (jsonData: string): void => {
  try {
    const data = JSON.parse(jsonData);
    if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    if (data.accounts) localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data.accounts));
    if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
    emitDataUpdate([
      STORAGE_KEYS.USERS,
      STORAGE_KEYS.ACCOUNTS,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.BUDGETS,
    ]);
  } catch (error) {
    throw new Error('Invalid data format');
  }
};
