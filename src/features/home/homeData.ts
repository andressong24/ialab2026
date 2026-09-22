import type { CurrencyCode, ExpenseCategoryId, FinanceData } from '@/data';

export type HomeCategorySummary = {
  readonly id: ExpenseCategoryId;
  readonly label: string;
  readonly budgetCents: number;
  readonly spentCents: number;
  readonly remainingCents: number;
  readonly percentage: number;
  readonly progressPercentage: number;
};

export type HomeDashboardData = {
  readonly currency: CurrencyCode;
  readonly locale: string;
  readonly reportingYear: string;
  readonly reportingMonthLabel: string;
  readonly monthlyIncomeCents: number;
  readonly spentCents: number;
  readonly remainingCents: number;
  readonly remainingPercentage: number;
  readonly categories: readonly HomeCategorySummary[];
};

export function formatCurrencyCents(amountCents: number, locale: string, currency: CurrencyCode) {
  const includesPartialUnit = Math.abs(amountCents) % 100 !== 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: includesPartialUnit ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function buildHomeDashboardData(data: FinanceData): HomeDashboardData {
  const expenses = data.expenses.filter((expense) => expense.occurredOn.startsWith(`${data.reportingMonth}-`));
  const spentByCategory = new Map<ExpenseCategoryId, number>();

  for (const expense of expenses) {
    spentByCategory.set(
      expense.categoryId,
      (spentByCategory.get(expense.categoryId) ?? 0) + expense.amountCents,
    );
  }

  const spentCents = expenses.reduce((total, expense) => total + expense.amountCents, 0);
  const remainingCents = data.monthlyIncomeCents - spentCents;
  const remainingPercentage = data.monthlyIncomeCents > 0
    ? Math.round((remainingCents / data.monthlyIncomeCents) * 100)
    : 0;
  const reportingDate = new Date(`${data.reportingMonth}-01T00:00:00.000Z`);
  const reportingMonthLabel = Number.isNaN(reportingDate.getTime())
    ? data.reportingMonth
    : new Intl.DateTimeFormat(data.locale, { month: 'long', timeZone: 'UTC' }).format(reportingDate);

  return {
    currency: data.currency,
    locale: data.locale,
    reportingYear: data.reportingMonth.slice(0, 4),
    reportingMonthLabel,
    monthlyIncomeCents: data.monthlyIncomeCents,
    spentCents,
    remainingCents,
    remainingPercentage,
    categories: data.categories.map((category) => {
      const categorySpentCents = spentByCategory.get(category.id) ?? 0;
      const percentage = category.monthlyBudgetCents > 0
        ? Math.round((categorySpentCents / category.monthlyBudgetCents) * 100)
        : 0;

      return {
        id: category.id,
        label: category.label,
        budgetCents: category.monthlyBudgetCents,
        spentCents: categorySpentCents,
        remainingCents: category.monthlyBudgetCents - categorySpentCents,
        percentage,
        progressPercentage: Math.min(Math.max(percentage, 0), 100),
      };
    }),
  };
}
