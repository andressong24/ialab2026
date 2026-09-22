# IA Lab Finance

A React Native app built with Expo, TypeScript, and Expo Router for iOS and Android. The web target provides a convenient way to preview screens during development.

The six-step finance setup flow and Home dashboard are implemented with explicit demo data. The remaining screens have working routes and clearly marked placeholders so teammates can build them independently. Completing setup opens the Home dashboard.

This project contains UI, navigation, and session-only client state. Authentication, device persistence, bank connections, receipt scanning, AI, and report exports are not implemented. Treat sample balances or transactions as demo data until real services are connected.

## Run locally

Use Node.js **24 LTS** (`nvm use` reads `.nvmrc`; minimum supported version is 22.13.0) and npm, then run these commands from the project root:

```sh
npm ci
npm start
```

Use the Expo development server to open the app on a device or simulator. For a physical device, install the Expo Go version compatible with the project's Expo SDK and scan the development server's QR code. The device and computer must be able to reach one another.

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server. |
| `npm run ios` | Open the iOS simulator; requires macOS and Xcode. |
| `npm run android` | Open an Android emulator or connected device; requires Android development tools. |
| `npm run web` | Start the browser preview. |
| `npm run typecheck` | Check TypeScript without emitting files. |
| `npm run lint` | Run the project's lint rules. |
| `npm test` | Run automated tests. |
| `npm run check` | Run the project's validation checks. |
| `npm run export:web` | Generate a production web export. |

The dependency versions in `package.json` and `package-lock.json` define the supported toolchain: Expo SDK 57, React Native 0.86, and React 19. Use `npx expo install <package>` for Expo and React Native packages so their versions match the installed SDK. Commit lockfile changes together with dependency changes.

The provided designs are included in [docs/design](docs/design): [welcome reference](docs/design/welcome-reference.png) and [screen overview](docs/design/screen-overview-reference.png). They are visual references; browser chrome and Figma controls are not app UI. Emoji rendering varies slightly between iOS, Android, and web.

The eight navigation tests render the real route tree and cover onboarding, all tabs, the expense/receipt back stack, shared expenses, direct entry, and missing-route recovery. Native bundles can be checked with `npx expo export --platform ios --platform android`; this does not replace testing on devices or simulators.

The initial dependency audit reports moderate upstream advisories in Expo's transitive `uuid` and `decode-uri-component` dependencies. There are no high or critical advisories in that audit. Recheck `npm audit` when updating the SDK; do not use `npm audit fix --force`, which currently proposes incompatible SDK downgrades.

## Project structure

```text
src/
  app/                         Expo Router route files and navigation layouts
    _layout.tsx                Root stack
    index.tsx                  Welcome route
    (tabs)/
      _layout.tsx              Main tab navigation
      home.tsx
      budget.tsx
      goals.tsx
      insights.tsx
      reports.tsx
    expenses/
      new.tsx
      receipt-review.tsx
    split-budget.tsx
    +not-found.tsx
  features/                    One independently owned folder per screen
    welcome/                   Implemented reference screen
    home/
    budget/
    goals/
    insights/
    reports/
    expenses/
    receipt-review/
    split-budget/
  data/                        Shared finance data contract and prototype fixture
  state/                       Session-only FinanceStore provider and reducer
  components/ui/               Shared Button, Screen, and ScreenPlaceholder
  navigation/routes.ts        Named, typed route destinations
  theme/tokens.ts              Shared colors, spacing, and other design tokens
docs/screens.md                Screen ownership, scope, and acceptance checklist
docs/design/                   Supplied visual references for the team
AGENTS.md                      Instructions for coding agents
```

`@/` resolves to `src/`. Keep route files small: they export a screen from its feature folder. Put a screen's components, hooks, validation, local types, and test fixtures alongside that screen. Share code only when more than one feature needs it.

## Routes and navigation

| Screen | URL | Route constant | Feature folder | Status |
| --- | --- | --- | --- | --- |
| Welcome flow | `/` | `routes.welcome` | `welcome` | Implemented |
| Home dashboard | `/home` | `routes.home` | `home` | Implemented |
| Budget setup | `/budget` | `routes.budget` | `budget` | Placeholder |
| Goal planner | `/goals` | `routes.goals` | `goals` | Placeholder |
| AI insights | `/insights` | `routes.insights` | `insights` | Placeholder |
| Monthly report | `/reports` | `routes.reports` | `reports` | Placeholder |
| Add expense | `/expenses/new` | `routes.addExpense` | `expenses` | Placeholder |
| AI receipt review | `/expenses/receipt-review` | `routes.receiptReview` | `receipt-review` | Placeholder |
| Split budget | `/split-budget` | `routes.splitBudget` | `split-budget` | Placeholder |

The root stack contains the welcome screen, the main tabs, and the expense/receipt/split flows. Home, Budget, Goals, Insights, and Reports are tabs. Parenthesized route groups such as `(tabs)` organize navigation without becoming part of the URL: navigate to `/budget`, not `/(tabs)/budget`.

Import destinations from the registry instead of scattering path strings throughout feature components:

```tsx
import { router } from 'expo-router';
import { routes } from '@/navigation/routes';

// A forward action: keep the current screen in the back stack.
router.push(routes.addExpense);

// A destination action: navigate to an existing destination when possible.
router.navigate(routes.home);

// Use when the previous screen should no longer be in the back stack.
router.replace(routes.home);

// Use when the current flow has a previous screen.
router.back();
```

For routes that can be opened directly, check `router.canGoBack()` before calling `router.back()` and provide an appropriate destination fallback. Do not assume the user always arrived from Home.

## Build an assigned screen

Most teammates can begin without modifying routing:

1. Claim a feature folder from [the screen work map](docs/screens.md).
2. Read `src/features/welcome/WelcomeScreen.tsx` for an example of component composition, theme usage, accessibility, safe areas, and responsive layout.
3. Replace the assigned feature's placeholder with its real UI. Keep its named screen export and `index.ts` barrel intact so the existing route continues working.
4. Reuse `src/components/ui` and `src/theme/tokens.ts`. Keep new components local to the feature until sharing has a clear benefit.
5. Connect actions through `routes`. Keep demo data local and explicit; do not imply a save, scan, transfer, or AI request succeeded unless it actually did.
6. Run `npm run check`, then open the screen and verify small-screen scrolling, large text, safe areas, and navigation. Verify iOS and Android behavior when those runtimes are available.
7. Update the screen's status in `docs/screens.md` with what is implemented and what still requires a service.

The welcome flow demonstrates implementation conventions. Other screens should follow their own supplied designs rather than copying the onboarding layout everywhere.

## Add a new screen

For example, adding a Settings screen outside the tabs:

1. Create `src/features/settings/SettingsScreen.tsx` with a named `SettingsScreen` component:

   ```tsx
   import { router } from 'expo-router';
   import { StyleSheet, Text } from 'react-native';
   import { Button } from '@/components/ui/Button';
   import { Screen } from '@/components/ui/Screen';
   import { routes } from '@/navigation/routes';
   import { theme } from '@/theme/tokens';

   export function SettingsScreen() {
     return (
       <Screen hasHeader>
         <Text style={styles.title} accessibilityRole="header">
           Settings
         </Text>
         <Button label="Go to home" onPress={() => router.navigate(routes.home)} />
       </Screen>
     );
   }

   const styles = StyleSheet.create({
     title: { color: theme.colors.text, fontSize: 28, fontWeight: '700' },
   });
   ```

   `Screen` provides a scrollable content area. Set `hasHeader` when the root stack already supplies the top safe area through its visible header; omit it for screens whose header is hidden, such as the main tabs.
2. Export the public screen from `src/features/settings/index.ts`:

   ```tsx
   export { SettingsScreen } from './SettingsScreen';
   ```

3. Add the thin route at `src/app/settings.tsx`:

   ```tsx
   export { SettingsScreen as default } from '@/features/settings';
   ```

4. Add `settings: '/settings'` to the `routes` object in `src/navigation/routes.ts`, preserving its `Href` type validation.
5. Expo Router discovers the file automatically. Configure a `Stack.Screen` in `src/app/_layout.tsx` when the new route needs specific header or presentation options. For a new main tab, put the route in `src/app/(tabs)/` and explicitly configure its `Tabs.Screen` in that group's `_layout.tsx`.
6. Connect an action with `router.push(routes.settings)` or `router.navigate(routes.settings)` as appropriate. Register its ownership and status in `docs/screens.md`.
7. Start Expo so route types are regenerated, then run the checks and open the new route directly as well as through its entry action.

Only route files and layouts belong under `src/app`: Expo Router treats files there as routes. Keep helpers, tests, assets, and reusable UI elsewhere.

## Work in parallel

Each screen has a feature folder and a thin route file so work can be divided without editing one large application component. Teammates should use separate branches or worktrees and primarily edit their assigned feature.

Coordinate changes to `package.json`, the lockfile, root and tab layouts, the route registry, theme tokens, and shared UI before making them. Preserve existing shared APIs; discuss a change before making every other screen adapt. Features should communicate through routes and explicit data contracts instead of importing another feature's internal components.

An example prompt for a teammate's Codex session:

```text
Read AGENTS.md, README.md, and docs/screens.md. Implement Budget setup
in src/features/budget using the supplied Budget setup design. Follow
WelcomeScreen's conventions and reuse the shared UI and theme. Keep
the existing BudgetScreen export and /budget route. Keep demo data local
and clearly labeled. Coordinate changes to shared files or dependencies.
Verify navigation and screen layout, run npm run check, and update the
Budget setup status in docs/screens.md. Report remaining service work.
```

New storage, authentication, shared financial state, and service integrations should have agreed contracts before multiple screen owners depend on them. Never commit credentials or real customer financial data.

The current prototype data contract is documented in [docs/data-contract.md](docs/data-contract.md), defined in [src/data/finance.ts](src/data/finance.ts), and accessed through the session-only repository in [src/data/financeRepository.ts](src/data/financeRepository.ts). Welcome onboarding edits are held by [src/state/FinanceStore.tsx](src/state/FinanceStore.tsx). These are session-only mechanisms, not durable storage or cross-device synchronization.
