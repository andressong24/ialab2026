import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme/tokens';

export function HomeScreen() {
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const [dismissedToast, setDismissedToast] = useState<string | null>(null);
  const toastMessage = Array.isArray(toast) ? toast[0] : toast;

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = setTimeout(() => setDismissedToast(toastMessage), 2600);

    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const visibleToast = toastMessage && dismissedToast !== toastMessage ? toastMessage : null;

  return (
    <View style={styles.container}>
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
      {visibleToast ? (
        <View accessible accessibilityLabel={visibleToast} accessibilityRole="alert" style={styles.toast}>
          <Feather name="check-circle" size={18} color={theme.colors.onPrimary} accessible={false} aria-hidden />
          <Text style={styles.toastText}>{visibleToast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toast: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.text,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    shadowColor: '#111827',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  toastText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
