# Finance data contract

The app currently has no backend, database, authentication, or device
persistence. The canonical prototype data lives in
[`src/data/finance.ts`](../src/data/finance.ts).

Screen owners should import from `@/data` and consult `financeData` (or its
selectors) instead of creating screen-specific copies of categories, currency,
reporting periods, merchants, or expenses.

## Expense shape

- `amountCents`: integer minor units; do not use floating-point currency values.
- `currency`: currently `USD`.
- `occurredOn`: an ISO calendar date (`YYYY-MM-DD`) without a timezone.
- `categoryId`: a stable `ExpenseCategoryId`, not a display label.
- `entryMode`: `manual` or `receipt`.
- `id`: stable identifier for a transaction.

This module is a read-only in-memory fixture for UI development. The Add
expense screen must not describe an action as persisted until a repository
implementation is connected. When persistence is introduced, keep this
domain shape and replace the fixture behind a shared repository/service so
screens do not change their data contract.
