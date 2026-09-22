import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';

export function GoalsScreen() {
  return (
    <ScreenPlaceholder
      eyebrow="SMALL STEPS, BIG PLANS"
      title="Goal planner"
      description="Make room for what matters to you. This starter is ready for savings goals and progress."
      icon="target"
      plannedFeatures={[
        'Create savings goals with target dates and amounts',
        'Show saved balances and progress toward each goal',
        'Plan and adjust monthly contributions',
      ]}
      actions={[{ label: 'Explore your budget', href: routes.budget }]}
    />
  );
}
