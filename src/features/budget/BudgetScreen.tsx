import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';

export function BudgetScreen() {
  return (
    <ScreenPlaceholder
      eyebrow="MAKE A PLAN"
      title="Budget setup"
      description="Give every dollar a purpose. This starter is ready for the monthly budget experience."
      icon="pie-chart"
      plannedFeatures={[
        'Monthly income and editable budget categories',
        'Allocation by percentage or fixed amount',
        'Allocated and unallocated totals with validation',
      ]}
      actions={[{ label: 'Back to home', href: routes.home }]}
    />
  );
}
