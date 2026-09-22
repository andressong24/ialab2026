import type { Href } from 'expo-router';

/** Use these paths instead of repeating route strings in feature components. */
export const routes = {
  welcome: '/',
  home: '/home',
  budget: '/budget',
  goals: '/goals',
  insights: '/insights',
  reports: '/reports',
  addExpense: '/expenses/new',
  receiptReview: '/expenses/receipt-review',
  splitBudget: '/split-budget',
} as const satisfies Record<string, Href>;
