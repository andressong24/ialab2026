# Screen work map

The feature folders below are independent units of work. Assign one owner to each folder; coordinate shared contracts before connecting data across screens. All routes already exist. Replace a feature's placeholder while preserving its screen export and route.

The six-step Welcome flow, Home dashboard, Add expense prototype, and Budget setup prototype are implemented. The remaining routes are navigation scaffolding with visible placeholders. The scopes and acceptance checks below describe the next implementation work; they do not imply that financial services or durable data persistence exist.

Designs: [welcome reference](design/welcome-reference.png) and [screen overview](design/screen-overview-reference.png). Each teammate can use these local images in their coding session.

| Screen | Route | Owner's folder | Screen export | Status |
| --- | --- | --- | --- | --- |
| Welcome flow | `/` | `src/features/welcome` | `WelcomeScreen` | Implemented |
| Home dashboard | `/home` | `src/features/home` | `HomeScreen` | Implemented |
| Add expense | `/expenses/new` | `src/features/expenses` | `AddExpenseScreen` | Implemented (prototype UI; no persistence or receipt service) |
| Budget setup | `/budget` | `src/features/budget` | `BudgetScreen` | Implemented (prototype) |
| Split budget | `/split-budget` | `src/features/split-budget` | `SplitBudgetScreen` | Placeholder |
| Goal planner | `/goals` | `src/features/goals` | `GoalsScreen` | Placeholder |
| AI receipt review | `/expenses/receipt-review` | `src/features/receipt-review` | `ReceiptReviewScreen` | Implemented (demo review) |
| AI insights | `/insights` | `src/features/insights` | `InsightsScreen` | Placeholder |
| Monthly report | `/reports` | `src/features/reports` | `ReportsScreen` | Placeholder |

## Welcome flow

**Reference:** The supplied six-step mobile onboarding designs.

**Implemented scope:** Intro screen, selectable financial priorities, local income and pay-frequency inputs, editable recurring expenses, starter allocations, setup-complete review, and a handoff to the Home dashboard. The flow uses the session-only FinanceStore; it does not persist onboarding data to the device or a backend.

**Reference checks:** Content stays readable and scrollable on compact displays and with larger system text; priority, income, frequency, and expense controls are locally interactive; back and continue actions move through all six steps; edits use the session-only FinanceStore and no backend or device persistence is used.

## Home dashboard

**Scope:** Monthly income, spending and remaining balance, earnings trend, expense/receipt entry actions, and budget category progress from the supplied Home dashboard design.

**Implemented in this pass:** Responsive dashboard summary derived from the shared session finance repository, including income/spend/remaining totals, expense and receipt quick actions, and category progress bars with accessible progress values. The monthly income displayed on the dashboard is supplied by the onboarding FinanceStore.

**Remaining:** Earnings trend visualization and durable persistence behind the shared data contract.

**Acceptance:** Clearly labeled sample data; consistent currency formatting; category progress matches displayed amounts; charts have a readable text summary; actions reach Add expense and Receipt review or an explicitly scoped capture step. Empty and unavailable data states are handled when a data contract exists.

**Dependencies to agree:** Budget summary, transaction list, income source, reporting period, and currency. Keep local fixtures until those contracts exist.

## Budget setup

**Scope:** Monthly income input, percentage or fixed-amount allocation, allocated/unallocated summary, category progress, category editing, and Save budget action.

**Implemented:** Responsive budget setup surface with editable prototype income and allocations, percentage/fixed-amount mode switching, reconciled allocation summary, category progress, monthly reports navigation, and explicit preview-only save feedback.

**Acceptance:** Numeric input and validation work across mobile keyboards; allocation totals reconcile with income; over-allocation is visible and handled; allocation mode changes have defined behavior; the save action accurately describes whether data is local, persisted, or still a prototype. This is the destination of Welcome's Get Started action.

**Dependencies to agree:** Budget/category schema, allocation units, rounding, persistence, and completion destination. The current implementation uses the session-only prototype finance data and does not persist changes.

## Add expense

**Scope:** Amount, merchant, date, category, notes, receipt entry action, entry mode, and Save expense action.

**Implemented:** Responsive manual-entry form with a receipt-review card at the top, dependency-free date/category disclosures, field validation, keyboard-aware scrolling, and navigation home with an `Expense saved` toast after a valid save.

**Acceptance:** Required fields and invalid amounts are validated; the keyboard does not cover focused inputs or actions; category/date selection is usable on both platforms; Receipt review navigation works; submission cannot claim to save data without a defined destination and storage contract.

**Dependencies to agree:** Use the shared transaction/category schema and session repository in [docs/data-contract.md](data-contract.md) for prototype UI. Durable storage, cross-device synchronization, currency/date handling, and receipt-capture handoff still need to be connected.

**Remaining service work:** Connect a persistence repository and real receipt capture/extraction before treating the save toast as durable transaction confirmation or the receipt action as a real upload.

## Split budget

**Scope:** Shared event summary, participants, total spending, equal/custom split controls, participant payments, settlement summary, and shared-expense actions.

**Acceptance:** Split amounts reconcile to the total with explicit rounding; participant balances and the settlement direction are correct; equal and custom splits are distinguishable; invalid splits are handled. No UI should imply a real payment or transfer occurred.

**Dependencies to agree:** Participants, shared expense schema, who paid versus who owes, rounding, and collaboration/storage behavior.

## Goal planner

**Scope:** Total saved across goals, individual goal cards with targets and dates, progress and monthly contribution estimates, create-goal action, and contribution adjustment.

**Acceptance:** Progress matches saved and target amounts; completed or past-due goals render sensibly; target/date inputs are validated; contribution estimates state their assumptions; create and adjust actions expose the implemented behavior clearly.

**Dependencies to agree:** Goal schema, contribution schedule, relationship to budget allocations, and persistence.

## AI receipt review

**Scope:** Receipt image preview, extraction status, editable merchant/date/amount/category/notes, confidence presentation, and review/confirmation actions.

**Implemented scope:** Receipt image upload with an empty state and compact selected-image thumbnail, extraction-complete state, editable merchant/date/amount/notes fields, a category select loaded from the shared finance contract, validation, session-store confirmation, and an honest non-persistent status message.

**Acceptance:** A sample extraction is explicitly labeled as demo data; the selected receipt image and all extracted fields can be corrected; date and USD amount inputs are validated; category confidence does not imply certainty; confirmation adds a receipt-mode expense to the shared in-memory store and clearly states that it is not persisted.

**Dependencies to agree:** Camera/library permissions, image ownership, extraction service and response schema, validation, and expense handoff. No scanning or AI service is wired in the scaffold.

## AI insights

**Scope:** Monthly spending summary, trend visualization, explanatory insight cards, and contextual actions matching the supplied design.

**Acceptance:** Claims can be traced to the displayed sample data or a real response; date ranges and comparison periods are explicit; no-data and failed-request states are defined when integrated; actionable links lead to their intended screens. Avoid presenting invented financial outcomes as real findings.

**Dependencies to agree:** Aggregated spending, comparison periods, insight response schema, and whether insights are computed locally or supplied by a service.

## Monthly report

**Scope:** Income/spent/saved summary, category spending chart, goals funded, savings insight, shared expense summary, and export/share actions.

**Acceptance:** Monthly totals reconcile to their inputs; currency and reporting period are clear; charts remain understandable without color alone; report/export actions describe their actual behavior; shared expense links reach the split flow. The scaffold does not export PDFs or send email.

**Dependencies to agree:** Reporting period and timezone, summary data contracts, chart data, generated document format, and platform sharing.

## Shared completion checklist

- Preserve the feature's public screen export and existing route.
- Use shared theme tokens and primitives; keep screen-specific components and fixtures local.
- Verify the screen from its existing entry action and from a direct route.
- Check safe areas, scrolling, readable text, touch targets, and keyboard behavior where applicable.
- Run `npm run check` and record any runtime that could not be verified.
- Update this file with the completed UI scope and any remaining service dependency.
