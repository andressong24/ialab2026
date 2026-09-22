# Implementation Plan: Add Expense Screen

**Status:** Completed
**Last Updated:** 2026-09-22

## Source Materials

- User-supplied add-expense screenshots - define the target information hierarchy and visual direction.
- [Screen work map](../screens.md) - defines ownership, route, acceptance criteria, and remaining service dependencies.
- [Finance data contract](../data-contract.md) - defines the expense shape and prototype-only persistence boundary.
- [AGENTS.md](../../AGENTS.md) and [README.md](../../README.md) - define feature ownership, navigation, shared UI, and validation conventions.

## Status

- Completed: Repository and design-reference discovery.
- Completed: Plan review, implementation, validation, second Astra/high-reasoning code review, and review feedback fixes.
- Remaining: Connect persistence and real receipt services in a future change.

## PR Status

| PR | Scope | Status | Depends On | Validation Gate |
|---|---|---|---|---|
| `PR-01` | Build and wire the add-expense form UI and local interaction states | Complete | - | `npm run check`, route tests, and browser preview of `/expenses/new` |

## Goal

Replace the add-expense placeholder with a scrollable, accessible manual-entry screen matching the supplied design direction, using canonical prototype finance data and honest demo-only submission behavior.

## Scope and Constraints

- In scope: amount, merchant, date, category, notes, receipt-review entry, entry-mode indicator, validation, and a demo-only save interaction.
- In scope: saved-expense and recent-merchant affordances shown in the reference, wired to populate the form locally.
- Out of scope: persistence, camera/library permissions, OCR/AI extraction, backend calls, authentication, and real transaction mutation.
- Constraint: use `financeData`, `getCategoryById`, and `getRecentMerchants`; store amount as integer minor units when validating/submitting.
- Constraint: preserve the existing `/expenses/new` route and `AddExpenseScreen` export; keep screen-specific code in `src/features/expenses`.
- Assumption: the initial form can be prefilled from the canonical Green Market fixture to match the supplied reference while still allowing edits.
- Deployment model: all-at-once.

## Implementation Shape

- Execution seam: `src/features/expenses/AddExpenseScreen.tsx`, rendered by the existing thin route.
- Existing path vs new path: replace the placeholder with a local controlled form; reuse the existing root-stack route and shared `Screen`, `Button`, theme, and route registry.
- Sequencing: derive initial values from canonical finance data, validate on submit and field interaction, expose local selection controls, then route to receipt review for the receipt action.
- Submission behavior: show a clear local confirmation state or inline message without adding to `financeData` or claiming persistence.

## Codebase Touchpoints

| Area / File | Planned Change | Test Impact |
|---|---|---|
| `src/features/expenses/AddExpenseScreen.tsx` | Build the form, cards, field controls, validation, saved/recent shortcuts, and demo-only submit state. | Component and interaction coverage. |
| `src/features/expenses/index.ts` | Preserve the public barrel export. | Route wiring remains covered by navigation tests. |
| `src/data/finance.ts` / `src/data/index.ts` | Read existing canonical categories and recent merchants; change only if a small selector/type gap is found. | Finance data tests remain authoritative. |
| `tests/navigation.test.tsx` | Update placeholder assertions and add add-expense interaction coverage if needed. | Route, receipt handoff, direct entry, and fallback behavior. |
| `docs/screens.md` | Mark Add expense as implemented and document remaining persistence/receipt-service work. | Documentation review. |

## PR / Review Strategy

- `PR-01`: one reviewable feature change, with the plan review before implementation and a code review after implementation; previous PR none, next PR none.
- Stacking: single PR.
- Merge guidance: keep shared contracts, dependencies, layouts, and lockfiles unchanged unless validation proves a necessary gap.
- Exclude: commit cadence, push timing, and other execution-only mechanics.

## Parallel Execution Notes

- Critical path: plan review → implementation → automated checks → browser verification → code review → feedback fixes.
- Parallel lane: the review agent can inspect the plan while no implementation files are changing; documentation and test updates can be prepared alongside the feature implementation but must reflect the final behavior.
- Serialization point: form behavior and validation must settle before updating tests and screen status.
- Coordination note: do not change the shared theme, shared UI primitives, or finance contract unless the implementation exposes a concrete reusable gap.

## PR 1: Add Expense Form

**PR ID:** `PR-01`
**Status:** Complete
**Objective:** Deliver the add-expense screen as a usable prototype form that visually follows the supplied references and honestly communicates its local-only behavior.
**Depends On:** None
**Parallelism:** Plan review is the gate. Once approved, feature implementation and focused test design can proceed together; final docs and validation follow the settled UI contract.

### Tasks

- [x] `P1-T01` Define local form state and validation for amount, merchant, date, category, and notes; normalize valid currency input into integer cents and ISO calendar dates.
- [x] `P1-T02` Replace the placeholder with the responsive add-expense layout: heading, summary card, saved expense cards, recent merchants, manual-entry fields, receipt card, entry-mode indicator, and primary action.
- [x] `P1-T03` Add usable cross-platform category/date affordances using platform-safe native controls already available in the project; keep controls accessible and keyboard-friendly.
- [x] `P1-T04` Wire the receipt action to `routes.receiptReview`; keep save local-only and label the result accurately.
- [x] `P1-T05` Add or update tests for required/invalid fields, canonical data rendering, receipt navigation, direct entry, and the non-persistent submission state.
- [x] `P1-T06` Update `docs/screens.md` and run the repository checks plus browser verification at `/expenses/new`.

### Validation Criteria

- [x] Empty or malformed amount, missing merchant, invalid date, and missing category produce clear field-level feedback and block submit.
- [x] Category and date controls can be operated with touch/keyboard semantics, and focused fields/actions remain usable while the keyboard is open.
- [x] The screen uses canonical categories/merchants and presents dates/currency consistently with the finance contract.
- [x] Receipt action reaches `/expenses/receipt-review`; direct `/expenses/new` entry still works with a home fallback.
- [x] Save produces a truthful local confirmation and does not mutate or imply persistence of the read-only fixture.
- [x] `npm run check` passes and the browser preview shows the intended screen without overflow that prevents reaching the save action.

### Risks / Open Questions

- The supplied references show a custom date/category presentation, while native picker support differs between web and mobile. Use a simple accessible pressable/select presentation that works in the current Expo targets; do not add a dependency for this screen.
- A full receipt upload flow is outside the scaffold. Keep the entry point navigational and label the receipt-review destination as the existing prototype flow.

## Cross-Cutting Validation

- [x] Unit/component tests cover amount parsing and validation edge cases.
- [x] Wiring tests prove the production route renders the form and receipt action navigates correctly.
- [x] Direct route and back-stack behavior remain covered.
- [x] Browser preview verifies compact-width scrolling, touch targets, readable contrast, and the final form state.
- [x] Documentation states what is implemented and what still requires persistence and receipt services.

Native iOS/Android runtimes were not available in this session; the browser preview and automated React Native route tests were exercised.

## Open Questions

- None blocking. The prototype-only submission behavior and initial Green Market values are explicit assumptions from the repository contract and supplied reference.

## Appendix: Review Log

| Date | Reviewer | Summary |
|---|---|---|
| 2026-09-22 | Astra/high-reasoning plan review | Plan boundaries are sound; add explicit cross-platform control, keyboard, validation, shortcut, receipt round-trip, and documentation requirements before implementation. |

## Appendix: Review Findings

**Review status:** Addressed; recommendations below were accepted as execution constraints and implemented.

### Scalability gaps

- None material for this prototype. The screen reads the small in-memory `financeData` fixture and does not introduce a persistence or aggregation path.

### Brittleness / overengineering

- **Dependency-free selection controls were underspecified.** `package.json` has no date-picker/select dependency and shared UI only provides basic `Screen`/`Button` primitives. Implement feature-local pressable category and date disclosures with selected-state accessibility, cancellation/close behavior, and web keyboard/touch operation; do not add a dependency.
- **Keyboard behavior was underspecified.** `src/components/ui/Screen.tsx` provides a `ScrollView` and `keyboardShouldPersistTaps`, but no keyboard-avoidance or focused-input behavior. Add feature-local `KeyboardAvoidingView`/scroll behavior as needed and verify the notes field and primary action with the keyboard open on compact layouts.

### Hand-waved complexity

- **Validation rules were too broad.** Accept positive decimal currency text with at most two fractional digits; reject blank, zero, negative, grouping separators, exponent notation, and unsafe values. Validate ISO dates as real calendar dates without timezone conversion; test impossible dates, leap days, cent precision, and whitespace-only merchants.
- **Shortcut state transitions were unspecified.** A saved-expense shortcut replaces amount, merchant, date, category, and notes from the complete fixture; a recent-merchant shortcut replaces merchant, category, and date while preserving amount and notes. Show that these are sample values, clear stale validation/confirmation feedback when a shortcut is applied, and keep the fixture immutable.
- **Receipt handoff lacked a testable round trip.** Use `router.push(routes.receiptReview)` from the form; rely on the existing stack so draft state remains mounted underneath; test entering values, opening receipt review, returning, and asserting draft values remain.
- **Reference traceability was incomplete.** The summary-card/saved-expense/recent-merchant additions are present in the supplied screenshot but not in the checked-in screen overview. Treat those additions as an explicit enhancement from the user-supplied reference, and update both `docs/screens.md` and the README route/status table when the screen is complete. Browser verification cannot establish iOS/Android behavior; record unavailable runtimes.

### Top recommendations

1. Keep all new parsing/validation helpers in `src/features/expenses` and cover them independently from navigation wiring.
2. Make the form controls and draft-preserving receipt path explicit in component tests and the route test.
3. Preserve the no-dependency, local-only prototype boundary and document any runtime that could not be exercised.
