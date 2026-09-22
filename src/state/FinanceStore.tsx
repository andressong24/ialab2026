import { createContext, useContext, useMemo, useReducer } from 'react';
import type { Dispatch, PropsWithChildren } from 'react';

import { financeData } from '@/data';
import type { ExpenseCategoryId } from '@/data';

export type OnboardingPriorityId = 'spending' | 'savings' | 'debt' | 'goals';
export type PayFrequency = 'weekly' | 'twice-monthly' | 'monthly';

export type OnboardingExpense = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly amountCents: number;
  readonly categoryId: ExpenseCategoryId;
};

export type FinanceStoreState = {
  readonly onboarding: {
    readonly priorities: readonly OnboardingPriorityId[];
    readonly monthlyIncomeCents: number;
    readonly payFrequency: PayFrequency;
    readonly recurringExpenses: readonly OnboardingExpense[];
  };
};

export type FinanceStoreAction =
  | { type: 'setPriorities'; priorities: readonly OnboardingPriorityId[] }
  | { type: 'setMonthlyIncomeCents'; amountCents: number }
  | { type: 'setPayFrequency'; frequency: PayFrequency }
  | { type: 'setRecurringExpenses'; expenses: readonly OnboardingExpense[] };

const defaultRecurringExpenses: readonly OnboardingExpense[] = [
  { id: 'rent', name: 'Rent', description: 'Housing · due on the 1st', amountCents: 165_000, categoryId: 'rent' },
  { id: 'utilities', name: 'Utilities', description: 'Electric, water, internet', amountCents: 24_000, categoryId: 'utilities' },
  { id: 'groceries', name: 'Groceries', description: 'Monthly estimate', amountCents: 60_000, categoryId: 'groceries' },
  { id: 'transportation', name: 'Transportation', description: 'Transit and fuel', amountCents: 32_000, categoryId: 'transportation' },
  { id: 'student-loan', name: 'Student loan', description: 'Minimum monthly payment', amountCents: 35_000, categoryId: 'loans' },
];

export const initialFinanceStoreState: FinanceStoreState = {
  onboarding: {
    priorities: ['spending', 'savings', 'goals'],
    monthlyIncomeCents: financeData.monthlyIncomeCents,
    payFrequency: 'twice-monthly',
    recurringExpenses: defaultRecurringExpenses,
  },
};

export function financeReducer(state: FinanceStoreState, action: FinanceStoreAction): FinanceStoreState {
  switch (action.type) {
    case 'setPriorities':
      return { ...state, onboarding: { ...state.onboarding, priorities: [...action.priorities] } };
    case 'setMonthlyIncomeCents':
      return { ...state, onboarding: { ...state.onboarding, monthlyIncomeCents: Math.max(0, Math.round(action.amountCents)) } };
    case 'setPayFrequency':
      return { ...state, onboarding: { ...state.onboarding, payFrequency: action.frequency } };
    case 'setRecurringExpenses':
      return { ...state, onboarding: { ...state.onboarding, recurringExpenses: [...action.expenses] } };
    default:
      return state;
  }
}

type FinanceStoreValue = {
  state: FinanceStoreState;
  dispatch: Dispatch<FinanceStoreAction>;
  actions: {
    setPriorities: (priorities: readonly OnboardingPriorityId[]) => void;
    setMonthlyIncomeCents: (amountCents: number) => void;
    setPayFrequency: (frequency: PayFrequency) => void;
    setRecurringExpenses: (expenses: readonly OnboardingExpense[]) => void;
  };
};

const FinanceStoreContext = createContext<FinanceStoreValue | null>(null);

export function FinanceStoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(financeReducer, initialFinanceStoreState);
  const actions = useMemo(() => ({
    setPriorities: (priorities: readonly OnboardingPriorityId[]) => dispatch({ type: 'setPriorities', priorities }),
    setMonthlyIncomeCents: (amountCents: number) => dispatch({ type: 'setMonthlyIncomeCents', amountCents }),
    setPayFrequency: (frequency: PayFrequency) => dispatch({ type: 'setPayFrequency', frequency }),
    setRecurringExpenses: (expenses: readonly OnboardingExpense[]) => dispatch({ type: 'setRecurringExpenses', expenses }),
  }), []);

  const value = useMemo(() => ({ state, dispatch, actions }), [actions, state]);

  return <FinanceStoreContext.Provider value={value}>{children}</FinanceStoreContext.Provider>;
}

export function useFinanceStore() {
  const value = useContext(FinanceStoreContext);
  if (!value) throw new Error('useFinanceStore must be used within FinanceStoreProvider');
  return value;
}
