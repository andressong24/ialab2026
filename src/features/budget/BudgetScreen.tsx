import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { financeData, getCategoryById, type ExpenseCategoryId } from '@/data';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme/tokens';

type AllocationMode = 'percentage' | 'amount';
type AllocationMap = Record<ExpenseCategoryId, number>;

const categoryOrder: ExpenseCategoryId[] = [
  'home',
  'groceries',
  'transportation',
  'activities',
  'loans',
  'education',
  'rent',
  'utilities',
];

const categoryTabs: ExpenseCategoryId[] = [
  'home',
  'groceries',
  'transportation',
  'activities',
  'loans',
];

const currencyFormatter = new Intl.NumberFormat(financeData.locale, {
  style: 'currency',
  currency: financeData.currency,
  maximumFractionDigits: 0,
});

const inputCurrencyFormatter = new Intl.NumberFormat(financeData.locale, {
  style: 'currency',
  currency: financeData.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(amountCents: number) {
  return currencyFormatter.format(amountCents / 100);
}

function formatInputCurrency(amountCents: number) {
  return inputCurrencyFormatter.format(amountCents / 100);
}

function parseCurrencyInput(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0;
}

function getInitialAllocations(): AllocationMap {
  return financeData.categories.reduce<AllocationMap>(
    (result, category) => ({ ...result, [category.id]: category.monthlyBudgetCents }),
    {} as AllocationMap,
  );
}

function getPercentage(amountCents: number, incomeCents: number) {
  return incomeCents > 0 ? Math.round((amountCents / incomeCents) * 100) : 0;
}

export function BudgetScreen() {
  const router = useRouter();
  const [incomeInput, setIncomeInput] = useState(
    formatInputCurrency(financeData.monthlyIncomeCents),
  );
  const [allocationMode, setAllocationMode] = useState<AllocationMode>('percentage');
  const [allocations, setAllocations] = useState<AllocationMap>(getInitialAllocations);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryId>('home');
  const [isEditing, setIsEditing] = useState(false);
  const [showCategoryNote, setShowCategoryNote] = useState(false);
  const [showSaveNote, setShowSaveNote] = useState(false);

  const incomeCents = parseCurrencyInput(incomeInput);
  const orderedCategories = useMemo(
    () => categoryOrder.map((id) => getCategoryById(id)).filter(Boolean),
    [],
  );
  const totalAllocatedCents = orderedCategories.reduce(
    (total, category) => total + allocations[category!.id],
    0,
  );
  const unallocatedCents = incomeCents - totalAllocatedCents;

  function handleIncomeChange(value: string) {
    setIncomeInput(value.replace(/[^0-9.]/g, ''));
    setShowSaveNote(false);
  }

  function handleIncomeBlur() {
    setIncomeInput(formatInputCurrency(parseCurrencyInput(incomeInput)));
  }

  function handleAllocationChange(categoryId: ExpenseCategoryId, value: string) {
    const numericValue = Number(value.replace(/[^0-9.]/g, ''));
    const nextValue = Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
    const nextAmountCents =
      allocationMode === 'percentage'
        ? Math.round((incomeCents * nextValue) / 100)
        : Math.round(nextValue * 100);

    setAllocations((current) => ({ ...current, [categoryId]: nextAmountCents }));
    setShowSaveNote(false);
  }

  function getAllocationInputValue(amountCents: number) {
    return allocationMode === 'percentage'
      ? String(getPercentage(amountCents, incomeCents))
      : (amountCents / 100).toFixed(2);
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.screenTitle}>
            Budget setup
          </Text>
          <Text style={styles.greeting}>Your plan is ready, Maya</Text>
          <Text style={styles.description}>
            Small updates are enough. You can adjust anything anytime.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Monthly income</Text>
          <TextInput
            accessibilityLabel="Monthly income"
            inputMode="decimal"
            keyboardType="decimal-pad"
            onBlur={handleIncomeBlur}
            onChangeText={handleIncomeChange}
            onFocus={() => setIncomeInput(String(incomeCents / 100))}
            style={styles.incomeInput}
            value={incomeInput}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Allocate by</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}>
            {categoryTabs.map((categoryId) => {
              const category = getCategoryById(categoryId);
              if (!category) return null;

              const selected = selectedCategory === category.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Select ${category.label}`}
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[styles.categoryTab, selected && styles.categoryTabSelected]}>
                  <Text style={[styles.categoryTabText, selected && styles.categoryTabTextSelected]}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change allocation mode"
            onPress={() => {
              setAllocationMode((current) => (current === 'percentage' ? 'amount' : 'percentage'));
              setShowSaveNote(false);
            }}
            style={styles.modeButton}>
            <Text style={styles.modeText}>
              {allocationMode === 'percentage'
                ? 'Percentage selected · switch to fixed amounts'
                : 'Fixed amounts selected · switch to percentages'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Allocated</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalAllocatedCents)}</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>
              {unallocatedCents >= 0 ? 'Unallocated' : 'Overallocated'}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                unallocatedCents < 0 && styles.summaryValueDanger,
              ]}>
              {formatCurrency(Math.abs(unallocatedCents))}
            </Text>
          </View>
        </View>

        <View style={styles.allocations}>
          {orderedCategories.map((category) => {
            if (!category) return null;

            const amountCents = allocations[category.id];
            const percentage = getPercentage(amountCents, incomeCents);
            const progressWidth = `${Math.min(Math.max(percentage, 0), 100)}%` as `${number}%`;

            return (
              <View key={category.id} style={styles.allocationRow}>
                <View style={styles.allocationHeader}>
                  <Text style={styles.allocationName}>{category.label}</Text>
                  {isEditing ? (
                    <TextInput
                      accessibilityLabel={`${category.label} allocation`}
                      inputMode="decimal"
                      keyboardType="decimal-pad"
                      onChangeText={(value) => handleAllocationChange(category.id, value)}
                      selectTextOnFocus
                      style={styles.allocationInput}
                      value={getAllocationInputValue(amountCents)}
                    />
                  ) : (
                    <Text style={styles.allocationValue}>
                      {percentage}% · {formatCurrency(amountCents)}
                    </Text>
                  )}
                </View>
                <View
                  accessible
                  accessibilityLabel={`${category.label} ${percentage}% allocated`}
                  style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.actionRow}>
          <CompactButton
            label="＋ Add category"
            onPress={() => setShowCategoryNote((current) => !current)}
            variant="secondary"
          />
          <CompactButton
            label={isEditing ? 'Done editing' : 'Edit allocations'}
            onPress={() => setIsEditing((current) => !current)}
            variant="secondary"
          />
        </View>

        {showCategoryNote ? (
          <Text style={styles.inlineNote}>
            Categories are defined in the shared prototype fixture for now.
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open monthly reports"
          onPress={() => router.navigate(routes.reports)}
          style={({ pressed }) => [styles.reportCard, pressed && styles.pressed]}>
          <View style={styles.reportIcon}>
            <Feather name="bar-chart-2" size={20} color={theme.colors.text} />
          </View>
          <View style={styles.reportCopy}>
            <Text style={styles.reportTitle}>Monthly reports</Text>
            <Text style={styles.reportDescription}>Track spending, trends, and progress</Text>
          </View>
          <Feather name="chevron-right" size={23} color={theme.colors.textMuted} />
        </Pressable>

        <CompactButton
          label="Save budget"
          onPress={() => setShowSaveNote(true)}
          variant="primary"
        />
        {showSaveNote ? (
          <Text accessibilityLiveRegion="polite" style={styles.saveNote}>
            Budget changes are preview-only and are not persisted yet.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

function CompactButton({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.compactButton,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.compactButtonText, variant === 'primary' && styles.primaryButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    gap: 14,
  },
  header: { gap: 5 },
  screenTitle: { color: theme.colors.textMuted, fontSize: 15, fontWeight: '600' },
  greeting: { color: theme.colors.text, fontSize: 14, lineHeight: 20, marginTop: 8 },
  description: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  section: { gap: 7 },
  label: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 16 },
  incomeInput: {
    height: 42,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 13,
    color: theme.colors.text,
    fontSize: 13,
  },
  categoryTabs: {
    alignItems: 'center',
    minWidth: '100%',
    paddingHorizontal: 2,
    gap: 2,
  },
  categoryTab: {
    minHeight: 28,
    paddingHorizontal: 11,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabSelected: { backgroundColor: theme.colors.primarySoft },
  categoryTabText: { color: theme.colors.textMuted, fontSize: 10, lineHeight: 14 },
  categoryTabTextSelected: { color: theme.colors.primary, fontWeight: '600' },
  modeButton: { alignSelf: 'flex-start', paddingVertical: 1 },
  modeText: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18 },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderRadius: 9,
    backgroundColor: '#F3FAF4',
    borderWidth: 1,
    borderColor: '#E3EEE4',
  },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 10, lineHeight: 14 },
  summaryValue: { color: theme.colors.text, fontSize: 24, lineHeight: 30, fontWeight: '500', marginTop: 2 },
  summaryValueDanger: { color: '#C44C4C' },
  allocations: { gap: 9 },
  allocationRow: { gap: 5 },
  allocationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  allocationName: { color: theme.colors.text, fontSize: 12, lineHeight: 17 },
  allocationValue: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 16 },
  allocationInput: {
    minWidth: 92,
    height: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    paddingHorizontal: 7,
    color: theme.colors.text,
    fontSize: 11,
    textAlign: 'right',
  },
  progressTrack: { height: 6, borderRadius: 4, backgroundColor: '#E9EAEE', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: theme.colors.success },
  actionRow: { flexDirection: 'row', gap: 9 },
  compactButton: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  primaryButton: { backgroundColor: theme.colors.success },
  compactButtonText: { color: theme.colors.text, fontSize: 11, lineHeight: 15, fontWeight: '500' },
  primaryButtonText: { color: theme.colors.onPrimary },
  reportCard: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  reportIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCopy: { flex: 1, gap: 2 },
  reportTitle: { color: theme.colors.text, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  reportDescription: { color: theme.colors.textMuted, fontSize: 10, lineHeight: 14 },
  inlineNote: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: -4 },
  saveNote: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: -4 },
  pressed: { opacity: 0.7 },
});
