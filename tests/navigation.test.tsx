import { describe, expect, it } from '@jest/globals';
import { router } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

describe('app navigation', () => {
  it('walks through the six-step welcome flow and opens the dashboard', async () => {
    const app = renderRouter('./src/app', { initialUrl: '/' });
    await app;

    expect(screen.getByRole('header', { name: /A calmer way to manage your/ })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    expect(screen.getByRole('header', { name: 'What matters most right now?' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('header', { name: 'Start with your take-home income' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('header', { name: 'Add your monthly essentials' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('header', { name: 'Give every dollar a job' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Review my plan' }));
    expect(screen.getByRole('header', { name: 'Your plan is ready, Maya' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Open my dashboard' }));
    expect(app.getPathname()).toBe('/home');
    expect(screen.getByRole('header', { name: 'Home dashboard' })).toBeOnTheScreen();
  });

  it('connects every main tab to its feature screen', async () => {
    const app = renderRouter('./src/app', { initialUrl: '/home' });
    await app;

    const destinations = [
      { tab: 'Budget', path: '/budget', heading: 'Budget setup' },
      { tab: 'Goals', path: '/goals', heading: 'Goal planner' },
      { tab: 'Insights', path: '/insights', heading: 'AI insights' },
      { tab: 'Reports', path: '/reports', heading: 'Monthly report' },
      { tab: 'Home', path: '/home', heading: 'Home dashboard' },
    ];

    for (const { tab, path, heading } of destinations) {
      await fireEvent.press(screen.getByLabelText(tab));

      expect(app.getPathname()).toBe(path);
      expect(screen.getByRole('header', { name: heading })).toBeOnTheScreen();
    }
  });

  it('opens expense and receipt flows and returns through their stack history', async () => {
    const app = renderRouter('./src/app', { initialUrl: '/home' });
    await app;

    await fireEvent.press(screen.getByRole('button', { name: 'Add an expense' }));
    expect(app.getPathname()).toBe('/expenses/new');

    await fireEvent.press(screen.getByRole('button', { name: 'Explore receipt review' }));
    expect(app.getPathname()).toBe('/expenses/receipt-review');
    expect(screen.getByRole('header', { name: 'AI receipt review' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Go back' }));
    expect(app.getPathname()).toBe('/expenses/new');

    await fireEvent.press(screen.getByRole('button', { name: 'Go back' }));
    expect(app.getPathname()).toBe('/home');
    expect(screen.getByRole('header', { name: 'Home dashboard' })).toBeOnTheScreen();
  });

  it('opens the shared-expense flow from reports', async () => {
    const app = renderRouter('./src/app', { initialUrl: '/reports' });
    await app;

    await fireEvent.press(screen.getByRole('button', { name: 'Explore shared expenses' }));

    expect(app.getPathname()).toBe('/split-budget');
    expect(screen.getByText('SHARE THE COST')).toBeOnTheScreen();
  });

  it.each([
    { path: '/expenses/new', heading: 'KEEP TRACK OF THE EVERYDAY' },
    { path: '/expenses/receipt-review', heading: 'CHECK THE DETAILS' },
    { path: '/split-budget', heading: 'SHARE THE COST' },
  ])('supports direct entry and a home fallback for $path', async ({ path, heading }) => {
    const app = renderRouter('./src/app', { initialUrl: path });
    await app;

    expect(app.getPathname()).toBe(path);
    expect(screen.getByText(heading)).toBeOnTheScreen();
    expect(router.canGoBack()).toBe(false);

    await fireEvent.press(screen.getByRole('button', { name: 'Go to home' }));

    expect(app.getPathname()).toBe('/home');
    expect(screen.getByRole('header', { name: 'Home dashboard' })).toBeOnTheScreen();
    expect(router.canGoBack()).toBe(false);
  });

  it('shows the missing-screen page and recovers to home', async () => {
    const app = renderRouter('./src/app', { initialUrl: '/does-not-exist' });
    await app;

    expect(screen.getByText('404 · SCREEN NOT FOUND')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Go to home'));

    expect(app.getPathname()).toBe('/home');
    expect(screen.getByRole('header', { name: 'Home dashboard' })).toBeOnTheScreen();
  });
});
