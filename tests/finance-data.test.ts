import { describe, expect, it } from '@jest/globals';
import { financeData, getCategoryById, getRecentMerchants } from '@/data';

describe('shared finance data', () => {
  it('keeps expense categories addressable by stable ids', () => {
    expect(getCategoryById('groceries')).toEqual({
      id: 'groceries',
      label: 'Groceries',
      monthlyBudgetCents: 60_000,
    });
  });

  it('derives recent merchants from the canonical expense list', () => {
    expect(getRecentMerchants()).toEqual([
      {
        merchant: 'Green Market',
        categoryId: 'groceries',
        occurredOn: '2026-09-22',
      },
      {
        merchant: 'Transit Pass',
        categoryId: 'transportation',
        occurredOn: '2026-09-18',
      },
    ]);
  });

  it('uses the same currency for the shared data set and its expenses', () => {
    expect(financeData.expenses.every((expense) => expense.currency === financeData.currency)).toBe(true);
  });
});
