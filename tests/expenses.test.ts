import { describe, expect, it } from '@jest/globals';

import { hasExpenseErrors, isValidIsoDate, parseAmountCents, validateExpenseDraft } from '@/features/expenses/expenseValidation';

describe('add expense validation', () => {
  it('parses positive currency values into integer cents', () => {
    expect(parseAmountCents('48.2')).toBe(4820);
    expect(parseAmountCents('48.20')).toBe(4820);
    expect(parseAmountCents('0.01')).toBe(1);
  });

  it.each(['', '0', '-1.00', '1.234', '1,000.00', '1e2', '  '])('rejects unsupported amount syntax: %s', (value) => {
    expect(parseAmountCents(value)).toBeNull();
  });

  it('validates real ISO calendar dates without timezone shifts', () => {
    expect(isValidIsoDate('2026-02-28')).toBe(true);
    expect(isValidIsoDate('2024-02-29')).toBe(true);
    expect(isValidIsoDate('2026-02-29')).toBe(false);
    expect(isValidIsoDate('2026-13-01')).toBe(false);
    expect(isValidIsoDate('09/22/2026')).toBe(false);
  });

  it('reports required field errors and accepts the seeded shape', () => {
    const errors = validateExpenseDraft({ amount: '48.20', merchant: 'Green Market', occurredOn: '2026-09-22', categoryId: 'groceries', notes: '' });
    expect(hasExpenseErrors(errors)).toBe(false);

    expect(validateExpenseDraft({ amount: '0', merchant: '  ', occurredOn: '2026-02-29', categoryId: 'groceries', notes: '' })).toEqual({
      amount: 'Enter an amount greater than $0 with up to two decimal places.',
      merchant: 'Enter a merchant.',
      occurredOn: 'Choose a valid date.',
    });
  });
});
