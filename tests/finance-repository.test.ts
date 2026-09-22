import { describe, expect, it, jest } from '@jest/globals';

import { financeData } from '@/data/finance';
import { createInMemoryFinanceRepository } from '@/data/financeRepository';

describe('in-memory finance repository', () => {
  it('creates an expense and notifies subscribers', () => {
    const repository = createInMemoryFinanceRepository();
    const listener = jest.fn();
    repository.subscribe(listener);

    const expense = repository.createExpense({
      amountCents: 1_250,
      currency: 'USD',
      merchant: 'Corner Cafe',
      occurredOn: '2026-09-23',
      categoryId: 'groceries',
      entryMode: 'manual',
    });

    expect(repository.getExpense(expense.id)).toEqual(expense);
    expect(repository.listExpenses()).toContainEqual(expense);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('updates and deletes an existing expense', () => {
    const repository = createInMemoryFinanceRepository();
    const original = repository.listExpenses()[0];

    const updated = repository.updateExpense(original.id, { amountCents: 5_000 });
    expect(updated.amountCents).toBe(5_000);
    expect(repository.deleteExpense(original.id)).toBe(true);
    expect(repository.getExpense(original.id)).toBeUndefined();
  });

  it('validates writes against the shared contract', () => {
    const repository = createInMemoryFinanceRepository();

    expect(() =>
      repository.createExpense({
        amountCents: 0,
        currency: financeData.currency,
        merchant: 'Invalid',
        occurredOn: '2026-09-23',
        categoryId: 'groceries',
        entryMode: 'manual',
      }),
    ).toThrow('positive integer');
  });
});
