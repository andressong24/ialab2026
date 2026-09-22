import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';

export function AddExpenseScreen() {
  return (
    <ScreenPlaceholder
      hasHeader
      eyebrow="KEEP TRACK OF THE EVERYDAY"
      title="Add expense"
      description="Capture the details of a purchase. This form starter does not save transactions yet."
      icon="plus-circle"
      plannedFeatures={[
        'Amount, merchant, date, category, and notes fields',
        'Validated manual entry and transaction saving',
        'Receipt upload or camera capture for review',
      ]}
      actions={[{ label: 'Explore receipt review', href: routes.receiptReview }]}
    />
  );
}
