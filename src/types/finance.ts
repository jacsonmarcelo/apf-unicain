export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT',
  DEBT = 'DEBT'
}

export interface Category {
  id: string;
  name: string;
  table: string;
  type: TransactionType;
}

export interface FinancialEntry {
  id: string;
  date: string; // ISO string
  description: string;
  tableId: string;
  categoryId: string;
  amount: number;
  createdAt: string;
  userId: string;
}

export interface BudgetLimit {
  id: string;
  categoryId: string;
  tableId: string;
  limitAmount: number;
  month: string; // YYYY-MM
  userId: string;
}

export interface RecurringEntry {
  id: string;
  description: string;
  tableId: string;
  categoryId: string;
  amount: number;
  dayOfMonth: number;
  userId: string;
  active: boolean;
}

export interface FinancialTable {
  id: string;
  name: string;
  type: TransactionType;
}
