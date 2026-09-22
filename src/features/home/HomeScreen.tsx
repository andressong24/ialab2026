import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { useFinanceData } from '@/data';
import type { CurrencyCode } from '@/data';
import { routes } from '@/navigation/routes';
import { useFinanceStore } from '@/state';
import { theme } from '@/theme/tokens';

import { buildHomeDashboardData, formatCurrencyCents, type HomeCategorySummary } from './homeData';

function QuickAction({
  icon,
  label,
  accessibilityLabel,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <View accessible={false} aria-hidden style={styles.quickActionIcon}>
        <Feather name={icon} size={16} color={theme.colors.text} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function BudgetCategory({
  category,
  locale,
  currency,
}: {
  category: HomeCategorySummary;
  locale: string;
  currency: CurrencyCode;
}) {
  const remainingLabel = category.remainingCents >= 0 ? 'left' : 'over';
  const remainingAmount = Math.abs(category.remainingCents);

  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{category.label}</Text>
        <Text style={styles.categorySummary}>
          {category.percentage}% · {formatCurrencyCents(category.spentCents, locale, currency)} spent ·{' '}
          {formatCurrencyCents(remainingAmount, locale, currency)} {remainingLabel}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${category.label} budget progress`}
        accessibilityValue={{ min: 0, max: 100, now: category.progressPercentage }}
        style={styles.progressTrack}
      >
        <View style={[styles.progressFill, { width: `${category.progressPercentage}%` }]} />
      </View>
    </View>
  );
}

export function HomeScreen() {
  const { toast } = useLocalSearchParams<{ toast?: string }>();
  const [dismissedToast, setDismissedToast] = useState<string | null>(null);
  const toastMessage = Array.isArray(toast) ? toast[0] : toast;
  const router = useRouter();
  const financeSnapshot = useFinanceData();
  const { state } = useFinanceStore();
  const dashboard = buildHomeDashboardData({
    ...financeSnapshot,
    monthlyIncomeCents: state.onboarding.monthlyIncomeCents,
  });
  const visibleToast = toastMessage && dismissedToast !== toastMessage ? toastMessage : null;

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = setTimeout(() => setDismissedToast(toastMessage), 2600);

    return () => clearTimeout(timeout);
  }, [toastMessage]);

  return (
    <View style={styles.container}>
      <Screen>
        <View style={styles.content}>
        <View style={styles.header}>
          <Text accessibilityRole="header" accessibilityLabel="Home dashboard" style={styles.greeting}>
            Good morning,{ '\n' }Maya
          </Text>
          <Text style={styles.subtitle}>{dashboard.reportingMonthLabel} overview · Demo data</Text>
        </View>

        <View style={styles.incomeCard}>
          <View style={styles.incomeCardHeader}>
            <View style={styles.incomeLabelGroup}>
              <View accessible={false} aria-hidden style={styles.incomeIcon}>
                <Feather name="credit-card" size={17} color={theme.colors.text} />
              </View>
              <Text style={styles.incomeLabel}>{dashboard.reportingYear} · Monthly Income</Text>
            </View>
            <Text style={styles.remainingBadge}>{dashboard.remainingPercentage}% Remaining</Text>
          </View>
          <Text style={styles.incomeAmount}>
            {formatCurrencyCents(dashboard.monthlyIncomeCents, dashboard.locale, dashboard.currency)}
          </Text>
          <View style={styles.incomeDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={styles.summaryValue}>
                {formatCurrencyCents(dashboard.spentCents, dashboard.locale, dashboard.currency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={styles.summaryValue}>
                {formatCurrencyCents(dashboard.remainingCents, dashboard.locale, dashboard.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <QuickAction
            icon="plus-circle"
            label="Add expense"
            accessibilityLabel="Add an expense"
            onPress={() => router.push(routes.addExpense)}
          />
          <QuickAction
            icon="grid"
            label="Scan receipt"
            accessibilityLabel="Explore receipt review"
            onPress={() => router.push(routes.receiptReview)}
          />
        </View>

        <View style={styles.budgetSection}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Budget categories</Text>
          <View style={styles.categoryList}>
            {dashboard.categories.map((category) => (
              <BudgetCategory
                key={category.id}
                category={category}
                locale={dashboard.locale}
                currency={dashboard.currency}
              />
            ))}
          </View>
        </View>
        </View>
      </Screen>
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
  content: { gap: 16 },
  header: { gap: 4, paddingTop: 4 },
  greeting: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  incomeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3FAF2',
    borderWidth: 1,
    borderColor: '#E8F0E6',
    gap: 10,
  },
  incomeCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  incomeLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
  incomeIcon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  incomeLabel: { color: '#5D6570', fontSize: 12, lineHeight: 17, flexShrink: 1 },
  remainingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#DBF0D5',
    color: '#4D8B47',
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
  },
  incomeAmount: { color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.8 },
  incomeDivider: { height: 1, backgroundColor: '#E5EEE3' },
  summaryRow: { flexDirection: 'row', gap: 24 },
  summaryItem: { flex: 1, gap: 2 },
  summaryLabel: { color: '#5D6570', fontSize: 9, lineHeight: 13 },
  summaryValue: { color: theme.colors.text, fontSize: 20, lineHeight: 26, fontWeight: '500', letterSpacing: -0.5 },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickAction: {
    flex: 1,
    minHeight: 61,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  quickActionIcon: { height: 18, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { color: theme.colors.text, fontSize: 14, lineHeight: 19, fontWeight: '500' },
  pressed: { opacity: 0.65 },
  budgetSection: { gap: 10 },
  sectionTitle: { color: theme.colors.text, fontSize: 22, lineHeight: 27, fontWeight: '800', letterSpacing: -0.7 },
  categoryList: { gap: 11 },
  categoryRow: { gap: 6 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  categoryName: { color: theme.colors.text, fontSize: 11, lineHeight: 15, fontWeight: '500' },
  categorySummary: { color: '#59616B', fontSize: 9, lineHeight: 14, flexShrink: 1 },
  progressTrack: { height: 5, overflow: 'hidden', borderRadius: 3, backgroundColor: '#E4E6E9' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: theme.colors.success },
});
