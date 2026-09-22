# Finance data contract

The app currently has no backend, database, authentication, or device
persistence. The canonical prototype data lives in
[`src/data/finance.ts`](../src/data/finance.ts).

The session-only onboarding state lives in
[`src/state/FinanceStore.tsx`](../src/state/FinanceStore.tsx). It holds
onboarding edits while the app is running and resets on reload or app
restart. It is intentionally not a persistence layer.

Screen owners should import from `@/data` and consult `financeRepository` (or
`useFinanceData`) instead of creating screen-specific copies of categories,
currency, reporting periods, merchants, or expenses.

The repository exposes `getSnapshot`, `listExpenses`, `getExpense`,
`createExpense`, `updateExpense`, `deleteExpense`, and `subscribe`. New screens
should use these operations rather than mutating `financeData` directly.

## Expense shape

- `amountCents`: integer minor units; do not use floating-point currency values.
- `currency`: currently `USD`.
- `occurredOn`: an ISO calendar date (`YYYY-MM-DD`) without a timezone.
- `categoryId`: a stable `ExpenseCategoryId`, not a display label.
- `entryMode`: `manual` or `receipt`.
- `id`: stable identifier for a transaction.

The default `financeRepository` is an in-memory, session-only implementation
for UI development. Writes are visible to every screen using the shared
repository during the current app session, but they are lost on reload and are
not shared across devices. The Add expense screen must not describe an action
as durably persisted until a persistent repository implementation is connected.
When persistence is introduced, keep this domain shape and replace the
in-memory adapter behind the same repository interface so screens do not
change their data contract.
