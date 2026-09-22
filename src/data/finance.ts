/**
 * Shared finance domain data for the prototype.
 *
 * Screens should read categories, budgets, and expenses from this module
 * instead of defining their own copies. This is intentionally an in-memory
 * fixture until a persistence service is agreed and connected.
 */

export type CurrencyCode = 'USD';

export type ExpenseCategoryId =
  | 'rent'
  | 'utilities'
  | 'groceries'
  | 'transportation'
  | 'home'
  | 'activities'
  | 'loans'
  | 'education';

export type ExpenseEntryMode = 'manual' | 'receipt';

export interface ExpenseCategory {
  readonly id: ExpenseCategoryId;
  readonly label: string;
  readonly monthlyBudgetCents: number;
}

export interface Expense {
  readonly id: string;
  readonly amountCents: number;
  readonly currency: CurrencyCode;
  readonly merchant: string;
  /** ISO calendar date (YYYY-MM-DD), without a timezone. */
  readonly occurredOn: string;
  readonly categoryId: ExpenseCategoryId;
  readonly notes?: string;
  /** Local URI for the selected receipt image while the prototype is open. */
  readonly receiptUri?: string;
  readonly entryMode: ExpenseEntryMode;
}

export interface FinanceData {
  readonly currency: CurrencyCode;
  readonly locale: string;
  readonly reportingMonth: string;
  readonly monthlyIncomeCents: number;
  readonly categories: readonly ExpenseCategory[];
  readonly expenses: readonly Expense[];
}

/**
 * Canonical prototype data. Keep this as the only demo source for financial
 * values used by screens until the repository is connected to a backend.
 */
export const financeData: FinanceData = {
  currency: 'USD',
  locale: 'en-US',
  reportingMonth: '2026-09',
  monthlyIncomeCents: 560_000,
  categories: [
    { id: 'rent', label: 'Rent', monthlyBudgetCents: 165_000 },
    { id: 'utilities', label: 'Utilities', monthlyBudgetCents: 24_000 },
    { id: 'groceries', label: 'Groceries', monthlyBudgetCents: 60_000 },
    { id: 'transportation', label: 'Transportation', monthlyBudgetCents: 40_000 },
    { id: 'home', label: 'Home', monthlyBudgetCents: 100_000 },
    { id: 'activities', label: 'Activities', monthlyBudgetCents: 30_000 },
    { id: 'loans', label: 'Loans', monthlyBudgetCents: 50_000 },
    { id: 'education', label: 'Education', monthlyBudgetCents: 30_000 },
  ],
  expenses: [
    {
      id: 'expense-green-market-2026-09-22',
      amountCents: 4_820,
      currency: 'USD',
      merchant: 'Green Market',
      occurredOn: '2026-09-22',
      categoryId: 'groceries',
      notes: 'Weekly produce and pantry items',
      entryMode: 'manual',
    },
    {
      id: 'expense-transit-pass-2026-09-18',
      amountCents: 2_400,
      currency: 'USD',
      merchant: 'Transit Pass',
      occurredOn: '2026-09-18',
      categoryId: 'transportation',
      entryMode: 'manual',
    },
  ],
};

export function getCategoryById(categoryId: ExpenseCategoryId) {
  return financeData.categories.find((category) => category.id === categoryId);
}

export function getRecentMerchants() {
  return financeData.expenses.map((expense) => ({
    merchant: expense.merchant,
    categoryId: expense.categoryId,
    occurredOn: expense.occurredOn,
  }));
}
