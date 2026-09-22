import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { financeData, getCategoryById, type Expense } from '@/data';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme/tokens';

import {
  hasExpenseErrors,
  type ExpenseDraft,
  type ExpenseErrors,
  isValidIsoDate,
  parseAmountCents,
  validateExpenseDraft,
} from './expenseValidation';

const seededExpense = financeData.expenses[0]!;

function createDraft(expense: Expense): ExpenseDraft {
  return {
    amount: (expense.amountCents / 100).toFixed(2),
    merchant: expense.merchant,
    occurredOn: expense.occurredOn,
    categoryId: expense.categoryId,
    notes: expense.notes ?? '',
  };
}

function formatDate(value: string) {
  if (!isValidIsoDate(value)) {
    return value;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(financeData.locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null;
}

export function AddExpenseScreen() {
  const [draft, setDraft] = useState<ExpenseDraft>(() => createDraft(seededExpense));
  const [errors, setErrors] = useState<ExpenseErrors>({});
  const [openPicker, setOpenPicker] = useState<'date' | 'category' | null>(null);
  const [dateDraft, setDateDraft] = useState(draft.occurredOn);
  const scrollRef = useRef<ScrollView>(null);
  const amountInputRef = useRef<TextInput>(null);
  const merchantInputRef = useRef<TextInput>(null);

  const category = getCategoryById(draft.categoryId);
  const updateDraft = (updates: Partial<ExpenseDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
  };

  const handleSubmit = () => {
    const nextErrors = validateExpenseDraft(draft);
    setErrors(nextErrors);
    if (hasExpenseErrors(nextErrors)) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      requestAnimationFrame(() => {
        if (nextErrors.amount) {
          amountInputRef.current?.focus();
        } else if (nextErrors.merchant) {
          merchantInputRef.current?.focus();
        }
      });
      return;
    }

    if (parseAmountCents(draft.amount) === null) {
      return;
    }

    router.replace({ pathname: routes.home, params: { toast: 'Expense saved' } });
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>Add expense</Text>
          <Text style={styles.description}>Start with a saved expense or recent merchant. You can update details later.</Text>
        </View>

        {hasExpenseErrors(errors) ? (
          <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.errorSummary}>
            Please correct the highlighted fields before continuing.
          </Text>
        ) : null}

        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Feather name="file-text" size={25} color={theme.colors.text} accessible={false} aria-hidden />
            <Text accessibilityRole="header" style={styles.receiptTitle}>Add a receipt</Text>
          </View>
          <Text style={styles.description}>Open a sample receipt for review. Camera, upload, and extraction are not connected in this prototype.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open sample receipt review"
            onPress={() => router.push(routes.receiptReview)}
            style={({ pressed }) => [styles.receiptAction, pressed && styles.pressed]}>
            <Feather name="arrow-up-circle" size={20} color={theme.colors.primary} accessible={false} aria-hidden />
            <Text style={styles.receiptActionText}>Open sample receipt review</Text>
          </Pressable>
          <Text style={styles.receiptNote}>Prototype flow: no camera, upload, or extraction service is connected yet.</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              accessibilityLabel="Amount"
              accessibilityHint={errors.amount}
              autoCapitalize="none"
              keyboardType="decimal-pad"
              ref={amountInputRef}
              onBlur={() => setErrors(validateExpenseDraft(draft))}
              onChangeText={(amount) => updateDraft({ amount })}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, errors.amount && styles.inputError]}
              value={draft.amount}
            />
            <FieldError message={errors.amount} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Merchant</Text>
            <TextInput
              accessibilityLabel="Merchant"
              accessibilityHint={errors.merchant}
              onBlur={() => setErrors(validateExpenseDraft(draft))}
              onChangeText={(merchant) => updateDraft({ merchant })}
              placeholder="Merchant name"
              placeholderTextColor={theme.colors.textMuted}
              ref={merchantInputRef}
              style={[styles.input, errors.merchant && styles.inputError]}
              value={draft.merchant}
            />
            <FieldError message={errors.merchant} />
          </View>

          <View style={styles.splitRow}>
            <View style={styles.splitField}>
              <Text style={styles.label}>Date</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Date, ${formatDate(draft.occurredOn)}`}
                accessibilityState={{ expanded: openPicker === 'date' }}
                onPress={() => {
                  setDateDraft(draft.occurredOn);
                  setOpenPicker(openPicker === 'date' ? null : 'date');
                }}
                style={[styles.select, errors.occurredOn && styles.inputError]}>
                <Text style={styles.selectText}>{formatDate(draft.occurredOn)}</Text>
                <Feather name="chevron-down" size={17} color={theme.colors.textMuted} accessible={false} aria-hidden />
              </Pressable>
              {openPicker === 'date' ? (
                <View style={styles.optionList}>
                  <TextInput
                    accessibilityLabel="Date in ISO format"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numbers-and-punctuation"
                    onChangeText={setDateDraft}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.dateInput, errors.occurredOn && styles.inputError]}
                    value={dateDraft}
                  />
                  <View style={styles.pickerActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Cancel date selection"
                      onPress={() => setOpenPicker(null)}
                      style={styles.pickerButtonSecondary}>
                      <Text style={styles.pickerButtonSecondaryText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Apply date selection"
                      onPress={() => {
                        if (!isValidIsoDate(dateDraft)) {
                          setErrors((current) => ({ ...current, occurredOn: 'Choose a valid date.' }));
                          return;
                        }
                        updateDraft({ occurredOn: dateDraft });
                        setErrors({});
                        setOpenPicker(null);
                      }}
                      style={styles.pickerButtonPrimary}>
                      <Text style={styles.pickerButtonPrimaryText}>Apply</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <FieldError message={errors.occurredOn} />
            </View>

            <View style={styles.splitField}>
              <Text style={styles.label}>Category</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Category, ${category?.label ?? 'Choose category'}`}
                accessibilityState={{ expanded: openPicker === 'category' }}
                onPress={() => setOpenPicker(openPicker === 'category' ? null : 'category')}
                style={[styles.select, errors.categoryId && styles.inputError]}>
                <Text numberOfLines={1} style={styles.selectText}>{category?.label ?? 'Choose category'}</Text>
                <Feather name="chevron-down" size={17} color={theme.colors.textMuted} accessible={false} aria-hidden />
              </Pressable>
              {openPicker === 'category' ? (
                <View style={styles.optionList}>
                  {financeData.categories.map((option) => (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select category ${option.label}`}
                      accessibilityState={{ selected: draft.categoryId === option.id }}
                      onPress={() => {
                        updateDraft({ categoryId: option.id });
                        setErrors({});
                        setOpenPicker(null);
                      }}
                      style={styles.option}>
                      <Text style={styles.optionText}>{option.label}</Text>
                      {draft.categoryId === option.id ? <Feather name="check" size={16} color={theme.colors.success} accessible={false} aria-hidden /> : null}
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <FieldError message={errors.categoryId} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              accessibilityLabel="Notes"
              multiline
              numberOfLines={3}
              onChangeText={(notes) => updateDraft({ notes })}
              placeholder="Add a note"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.notesInput]}
              textAlignVertical="top"
              value={draft.notes}
            />
          </View>
        </View>

        <Button label="Save expense" onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardAvoidingView: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: theme.layout.contentMaxWidth, alignSelf: 'center', padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: theme.spacing.lg },
  header: { gap: theme.spacing.xs },
  title: { color: theme.colors.text, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1.2 },
  description: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 22 },
  section: { gap: theme.spacing.sm },
  pressed: { opacity: 0.7 },
  fieldGroup: { gap: theme.spacing.xs },
  label: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' },
  input: { minHeight: 48, borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 14, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  inputError: { borderColor: '#C85151' },
  error: { color: '#A73D3D', fontSize: 12, lineHeight: 17 },
  errorSummary: { color: '#A73D3D', backgroundColor: '#FBECEC', borderRadius: theme.radii.sm, padding: theme.spacing.sm, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  splitRow: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' },
  splitField: { flex: 1, gap: theme.spacing.xs },
  select: { minHeight: 48, borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.xs },
  selectText: { color: theme.colors.text, fontSize: 13, flex: 1 },
  optionList: { borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, backgroundColor: theme.colors.surface, overflow: 'hidden' },
  dateInput: { minHeight: 44, color: theme.colors.text, fontSize: 13, paddingHorizontal: theme.spacing.sm, borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
  option: { minHeight: 42, paddingHorizontal: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
  optionText: { color: theme.colors.text, fontSize: 13 },
  pickerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, padding: theme.spacing.sm },
  pickerButtonSecondary: { minHeight: 36, justifyContent: 'center', paddingHorizontal: theme.spacing.sm },
  pickerButtonSecondaryText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '700' },
  pickerButtonPrimary: { minHeight: 36, justifyContent: 'center', borderRadius: theme.radii.sm, paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.success },
  pickerButtonPrimaryText: { color: theme.colors.onPrimary, fontSize: 13, fontWeight: '700' },
  notesInput: { minHeight: 76, paddingTop: theme.spacing.sm },
  receiptCard: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.sm, borderWidth: 1, padding: theme.spacing.md, gap: theme.spacing.sm },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  receiptTitle: { color: theme.colors.text, fontSize: 23, lineHeight: 28, fontWeight: '800', letterSpacing: -0.6 },
  receiptAction: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, minHeight: 40 },
  receiptActionText: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
  receiptNote: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 16 },
});
