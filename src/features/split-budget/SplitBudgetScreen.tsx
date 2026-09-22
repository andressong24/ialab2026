import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';

export function SplitBudgetScreen() {
  return (
    <ScreenPlaceholder
      hasHeader
      eyebrow="SHARE THE COST"
      title="Split budget"
      description="Keep shared spending easy to follow. This starter is ready for groups, contributions, and balances."
      icon="users"
      plannedFeatures={[
        'Group members, shared expenses, and total spending',
        'Equal or custom splits with each person’s contribution',
        'Settlement balances and shared expense review',
      ]}
      actions={[{ label: 'Back to home', href: routes.home }]}
    />
  );
}
