import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';

export function ReportsScreen() {
  return (
    <ScreenPlaceholder
      eyebrow="SEE THE BIGGER PICTURE"
      title="Monthly report"
      description="A clearer view of each month's progress. This starter is ready for reporting and summaries."
      icon="bar-chart-2"
      plannedFeatures={[
        'Monthly income, spending, and savings summary',
        'Category breakdowns and goal contributions',
        'Shared expense summary and report export',
      ]}
      actions={[{ label: 'Explore shared expenses', href: routes.splitBudget }]}
    />
  );
}
