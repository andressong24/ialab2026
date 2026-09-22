import type {
  Expense,
  ExpenseCategoryId,
  ExpenseEntryMode,
  FinanceData,
} from './finance';
import { financeData } from './finance';

export type ExpenseInput = Omit<Expense, 'id'>;
export type ExpenseUpdate = Partial<ExpenseInput>;

export interface FinanceRepository {
  getSnapshot(): FinanceData;
  listExpenses(): readonly Expense[];
  getExpense(id: string): Expense | undefined;
  createExpense(input: ExpenseInput): Expense;
  updateExpense(id: string, changes: ExpenseUpdate): Expense;
  deleteExpense(id: string): boolean;
  subscribe(listener: () => void): () => void;
}

function cloneFinanceData(source: FinanceData): FinanceData {
  return {
    ...source,
    categories: source.categories.map((category) => ({ ...category })),
    expenses: source.expenses.map((expense) => ({ ...expense })),
  };
}

function validateExpense(expense: ExpenseInput) {
  if (!Number.isInteger(expense.amountCents) || expense.amountCents <= 0) {
    throw new Error('Expense amount must be a positive integer number of cents.');
  }

  if (!expense.merchant.trim()) {
    throw new Error('Expense merchant is required.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(expense.occurredOn)) {
    throw new Error('Expense date must use YYYY-MM-DD format.');
  }

  if (expense.currency !== financeData.currency) {
    throw new Error(`Only ${financeData.currency} expenses are supported.`);
  }

  if (!financeData.categories.some((category) => category.id === expense.categoryId)) {
    throw new Error(`Unknown expense category: ${expense.categoryId}.`);
  }

  if (expense.entryMode !== 'manual' && expense.entryMode !== 'receipt') {
    throw new Error(`Unknown expense entry mode: ${expense.entryMode}.`);
  }
}

/**
 * Session-only repository used by the prototype. Replace this implementation
 * with a persistent adapter without changing the screens' data contract.
 */
export function createInMemoryFinanceRepository(
  initialData: FinanceData = financeData,
): FinanceRepository {
  let snapshot = cloneFinanceData(initialData);
  let nextId = 1;
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => snapshot,
    listExpenses: () => snapshot.expenses,
    getExpense: (id) => snapshot.expenses.find((expense) => expense.id === id),
    createExpense: (input) => {
      validateExpense(input);
      const expense: Expense = {
        ...input,
        id: `expense-local-${Date.now()}-${nextId++}`,
      };
      snapshot = { ...snapshot, expenses: [...snapshot.expenses, expense] };
      notify();
      return expense;
    },
    updateExpense: (id, changes) => {
      const currentExpense = snapshot.expenses.find((expense) => expense.id === id);
      if (!currentExpense) {
        throw new Error(`Expense not found: ${id}.`);
      }

      const updatedExpense = { ...currentExpense, ...changes };
      validateExpense(updatedExpense);
      snapshot = {
        ...snapshot,
        expenses: snapshot.expenses.map((expense) =>
          expense.id === id ? updatedExpense : expense,
        ),
      };
      notify();
      return updatedExpense;
    },
    deleteExpense: (id) => {
      const exists = snapshot.expenses.some((expense) => expense.id === id);
      if (!exists) {
        return false;
      }

      snapshot = {
        ...snapshot,
        expenses: snapshot.expenses.filter((expense) => expense.id !== id),
      };
      notify();
      return true;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Shared session store used by all screens in the prototype. */
export const financeRepository = createInMemoryFinanceRepository();

export type { ExpenseCategoryId, ExpenseEntryMode };
