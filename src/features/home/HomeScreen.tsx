import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';

export function HomeScreen() {
  return (
    <ScreenPlaceholder
      eyebrow="YOUR FINANCIAL OVERVIEW"
      title="Home dashboard"
      description="A home for your monthly money picture. This screen is a starter for the team to build."
      icon="home"
      plannedFeatures={[
        'Monthly income, spending, and available balance',
        'Earnings history and budget category progress',
        'Quick access to expenses, receipts, and shared costs',
      ]}
      actions={[
        { label: 'Add an expense', href: routes.addExpense },
        { label: 'Review a receipt', href: routes.receiptReview, variant: 'secondary' },
        { label: 'Explore split budget', href: routes.splitBudget, variant: 'secondary' },
      ]}
    />
  );
}
