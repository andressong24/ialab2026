import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';

export function ReceiptReviewScreen() {
  return (
    <ScreenPlaceholder
      hasHeader
      eyebrow="CHECK THE DETAILS"
      title="AI receipt review"
      description="Review receipt details before saving an expense. This starter has no connected extraction service yet."
      icon="file-text"
      plannedFeatures={[
        'Preview an uploaded or photographed receipt',
        'Review extracted fields and confidence indicators',
        'Edit details and confirm the expense before saving',
      ]}
      actions={[{ label: 'Explore manual expense entry', href: routes.addExpense }]}
    />
  );
}
