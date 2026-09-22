import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

export function InsightsScreen() {
  return (
    <ScreenPlaceholder
      eyebrow="UNDERSTAND YOUR MONEY"
      title="AI insights"
      description="Turn spending patterns into useful context. This starter has no connected AI or financial data yet."
      icon="zap"
      plannedFeatures={[
        'Compare spending trends across months and categories',
        'Highlight recurring expenses and subscriptions',
        'Explain suggestions with supporting transaction data',
      ]}
    />
  );
}
