import { describe, expect, it } from '@jest/globals';
import { financeData, getCategoryById, getRecentMerchants } from '@/data';
import { financeReducer, initialFinanceStoreState } from '@/state';

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

  it('keeps onboarding edits in the session store using integer cents', () => {
    const incomeState = financeReducer(initialFinanceStoreState, {
      type: 'setMonthlyIncomeCents',
      amountCents: 560_000.4,
    });
    const prioritiesState = financeReducer(incomeState, {
      type: 'setPriorities',
      priorities: ['spending', 'debt'],
    });

    expect(prioritiesState.onboarding.monthlyIncomeCents).toBe(560_000);
    expect(prioritiesState.onboarding.priorities).toEqual(['spending', 'debt']);
    expect(prioritiesState.onboarding.recurringExpenses[0].amountCents).toBe(165_000);
  });
});
