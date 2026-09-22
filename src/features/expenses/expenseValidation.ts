import type { ExpenseCategoryId } from '@/data';

export type ExpenseDraft = {
  amount: string;
  merchant: string;
  occurredOn: string;
  categoryId: ExpenseCategoryId;
  notes: string;
};

export type ExpenseField = keyof Pick<ExpenseDraft, 'amount' | 'merchant' | 'occurredOn' | 'categoryId'>;
export type ExpenseErrors = Partial<Record<ExpenseField, string>>;

/** Accepts plain positive currency text with zero, one, or two fractional digits. */
export function parseAmountCents(value: string) {
  const normalized = value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole, fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(`${fraction}00`.slice(0, 2));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

/** Validates an ISO calendar date without allowing timezone conversion to change the day. */
export function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day)
  );
}

export function validateExpenseDraft(draft: ExpenseDraft): ExpenseErrors {
  const errors: ExpenseErrors = {};

  if (parseAmountCents(draft.amount) === null) {
    errors.amount = 'Enter an amount greater than $0 with up to two decimal places.';
  }
  if (!draft.merchant.trim()) {
    errors.merchant = 'Enter a merchant.';
  }
  if (!isValidIsoDate(draft.occurredOn)) {
    errors.occurredOn = 'Choose a valid date.';
  }
  if (!draft.categoryId) {
    errors.categoryId = 'Choose a category.';
  }

  return errors;
}

export function hasExpenseErrors(errors: ExpenseErrors) {
  return Object.keys(errors).length > 0;
}
