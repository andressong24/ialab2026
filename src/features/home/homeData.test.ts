import { describe, expect, it } from '@jest/globals';

import { financeData } from '@/data';

import { buildHomeDashboardData, formatCurrencyCents } from './homeData';

describe('Home dashboard data', () => {
  it('derives the monthly summary from the canonical finance fixture', () => {
    const dashboard = buildHomeDashboardData(financeData);

    expect(dashboard).toMatchObject({
      reportingYear: '2026',
      reportingMonthLabel: 'September',
      monthlyIncomeCents: 560_000,
      spentCents: 7_220,
      remainingCents: 552_780,
      remainingPercentage: 99,
    });
  });

  it('aggregates expense amounts into their budget categories', () => {
    const dashboard = buildHomeDashboardData(financeData);

    expect(dashboard.categories.find((category) => category.id === 'groceries')).toMatchObject({
      spentCents: 4_820,
      remainingCents: 55_180,
      percentage: 8,
    });
    expect(dashboard.categories.find((category) => category.id === 'transportation')).toMatchObject({
      spentCents: 2_400,
      remainingCents: 37_600,
      percentage: 6,
    });
    expect(dashboard.categories.find((category) => category.id === 'rent')).toMatchObject({
      spentCents: 0,
      remainingCents: 165_000,
      percentage: 0,
    });
  });

  it('formats whole and partial currency units using the shared locale and currency', () => {
    expect(formatCurrencyCents(560_000, financeData.locale, financeData.currency)).toBe('$5,600');
    expect(formatCurrencyCents(7_220, financeData.locale, financeData.currency)).toBe('$72.20');
  });
});
