import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { financeRepository, useFinanceData } from '@/data';
import type { ExpenseCategoryId } from '@/data';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme/tokens';

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseAmountCents(value: string) {
  const normalized = value.replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [whole, fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function formatUsdInput(value: string) {
  const numericValue = value.replace(/[^\d.]/g, '');
  if (!numericValue) return '';

  const firstDecimalIndex = numericValue.indexOf('.');
  const hasDecimal = firstDecimalIndex >= 0;
  const whole = (hasDecimal ? numericValue.slice(0, firstDecimalIndex) : numericValue).replace(/^0+(?=\d)/, '');
  const decimal = hasDecimal ? numericValue.slice(firstDecimalIndex + 1).slice(0, 2) : '';

  return `$${whole || '0'}${hasDecimal ? `.${decimal}` : ''}`;
}

function normalizeUsdAmount(value: string) {
  const formatted = formatUsdInput(value);
  if (!formatted) return '';

  const [whole, decimal = ''] = formatted.slice(1).split('.');
  return `$${whole}.${decimal.padEnd(2, '0')}`;
}

function ReceiptPreview({ imageUri, onPickImage }: { imageUri?: string; onPickImage: () => void }) {
  return (
    <View style={styles.preview} accessible accessibilityLabel="Receipt image preview">
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={styles.emptyPreview}>
          <Feather name="image" size={28} color={theme.colors.textMuted} />
          <Text style={styles.emptyPreviewText}>No receipt selected</Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={imageUri ? 'Change receipt image' : 'Upload receipt image'}
        onPress={onPickImage}
        style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}>
        <Feather name={imageUri ? 'refresh-cw' : 'upload'} size={17} color={theme.colors.text} />
        <Text style={styles.uploadButtonText}>{imageUri ? 'Change receipt image' : 'Upload receipt image'}</Text>
      </Pressable>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numbers-and-punctuation';
  placeholder?: string;
  maxLength?: number;
  onBlur?: () => void;
  style?: object;
};

function Field({ label, value, onChangeText, accessibilityLabel, keyboardType, placeholder, maxLength, onBlur, style }: FieldProps) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        maxLength={maxLength}
        onBlur={onBlur}
        placeholderTextColor={theme.colors.textMuted}
      />
    </View>
  );
}

export function ReceiptReviewScreen() {
  const router = useRouter();
  const { categories } = useFinanceData();
  const [merchant, setMerchant] = useState('Green Market');
  const [date, setDate] = useState('2026-09-22');
  const [amount, setAmount] = useState('$48.20');
  const [categoryId, setCategoryId] = useState<ExpenseCategoryId>('groceries');
  const [notes, setNotes] = useState('Weekly groceries');
  const [receiptImageUri, setReceiptImageUri] = useState<string>();
  const [formError, setFormError] = useState('');
  const [storeMessage, setStoreMessage] = useState('');

  const selectedCategory = categories.find((category) => category.id === categoryId);

  const pickReceiptImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled) {
        setReceiptImageUri(result.assets[0].uri);
        setStoreMessage('Receipt image selected locally and ready for review.');
        setFormError('');
      }
    } catch {
      setFormError('We could not open the image picker. Please try again.');
    }
  };

  const confirmExpense = () => {
    const amountCents = parseAmountCents(amount);
    const trimmedMerchant = merchant.trim();
    const errors = [];

    if (!trimmedMerchant) errors.push('Enter a merchant name.');
    if (!isValidIsoDate(date)) errors.push('Enter a valid date as YYYY-MM-DD.');
    if (amountCents === null) errors.push('Enter a valid USD amount with up to two decimals.');

    if (errors.length > 0 || amountCents === null) {
      setFormError(errors.join(' '));
      setStoreMessage('');
      return;
    }

    const expense = financeRepository.createExpense({
      amountCents,
      currency: 'USD',
      merchant: trimmedMerchant,
      occurredOn: date,
      categoryId,
      notes: notes.trim() || undefined,
      receiptUri: receiptImageUri,
      entryMode: 'receipt',
    });

    setFormError('');
    setStoreMessage(
      `Expense sent to the shared store: ${expense.merchant} · $${(expense.amountCents / 100).toFixed(2)} USD · ${selectedCategory?.label ?? expense.categoryId} · ${expense.occurredOn}.`,
    );
  };

  return (
    <Screen hasHeader>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHECK THE DETAILS</Text>
        <Text accessibilityRole="header" style={styles.title}>Review receipt</Text>
        <Text style={styles.subtitle}>We extracted these details. Check before saving.</Text>
      </View>

      <ReceiptPreview imageUri={receiptImageUri} onPickImage={pickReceiptImage} />

      <View style={styles.extractionCard} accessibilityRole="summary">
        <View style={styles.extractionTitleRow}>
          <Text style={styles.extractionTitle}>Extraction complete</Text>
          <View style={styles.selectedBadge}>
            <Feather name="check" size={13} color={theme.colors.success} />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        </View>
        <Text style={styles.confidence}>High confidence · fields remain editable</Text>
      </View>

      <View style={styles.form}>
        <Field label="Merchant" value={merchant} onChangeText={setMerchant} />
        <View style={styles.row}>
          <Field
            label="Date"
            value={date}
            onChangeText={(value) => setDate(value.replace(/[^\d-]/g, '').slice(0, 10))}
            accessibilityLabel="Date (YYYY-MM-DD)"
            keyboardType="numbers-and-punctuation"
            placeholder="YYYY-MM-DD"
            maxLength={10}
            style={styles.halfField}
          />
          <Field
            label="Amount (USD)"
            value={amount}
            onChangeText={(value) => setAmount(formatUsdInput(value))}
            keyboardType="decimal-pad"
            placeholder="$0.00"
            maxLength={14}
            onBlur={() => setAmount(normalizeUsdAmount(amount))}
            style={styles.halfField}
          />
        </View>
        <View style={styles.categoryHeading}>
          <Text style={styles.fieldLabel}>Suggested category · 94% confidence</Text>
          <Feather name="info" size={15} color={theme.colors.textMuted} accessible={false} />
        </View>
        <View style={styles.categoryPickerContainer}>
          <Picker
            accessibilityLabel="Expense category"
            selectedValue={categoryId}
            onValueChange={(value) => setCategoryId(value as ExpenseCategoryId)}
            style={styles.categoryPicker}>
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.label} value={category.id} />
            ))}
          </Picker>
        </View>
        <Field label="Notes" value={notes} onChangeText={setNotes} />
      </View>

      {formError ? (
        <View style={styles.errorMessage} accessible accessibilityLiveRegion="polite">
          <Feather name="alert-circle" size={18} color="#B42318" />
          <Text style={styles.errorMessageText}>{formError}</Text>
        </View>
      ) : null}
      {storeMessage ? (
        <View style={styles.storeMessage} accessible accessibilityLiveRegion="polite">
          <Feather name="check-circle" size={18} color={theme.colors.success} />
          <Text style={styles.storeMessageText}>{storeMessage}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          label="Confirm expense"
          icon="check"
          accessibilityHint="Validates the receipt and sends the expense to the shared in-memory store"
          onPress={confirmExpense}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          accessibilityHint="Returns to the previous screen without confirming the expense"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(routes.home);
            }
          }}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
          <Feather name="x" size={18} color={theme.colors.text} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.sm, paddingTop: theme.spacing.md },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  title: { color: theme.colors.text, fontSize: 32, lineHeight: 39, fontWeight: '700', letterSpacing: -1 },
  subtitle: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 24 },
  preview: { minHeight: 286, padding: theme.spacing.md, borderRadius: theme.radii.lg, backgroundColor: '#E9EBE9', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', gap: theme.spacing.md },
  thumbnail: { width: 132, height: 174, borderRadius: theme.radii.sm },
  emptyPreview: { minHeight: 174, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
  emptyPreviewText: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '600' },
  uploadButton: { minHeight: 44, paddingHorizontal: theme.spacing.md, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
  uploadButtonText: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  extractionCard: { padding: theme.spacing.lg, borderRadius: theme.radii.lg, backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#D2EAE1', gap: theme.spacing.md, shadowColor: '#315A4D', shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  extractionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  extractionTitle: { flex: 1, color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -1 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: theme.radii.sm, backgroundColor: '#D8EDDE' },
  selectedText: { color: theme.colors.success, fontSize: 12, fontWeight: '700' },
  confidence: { color: '#369B3E', fontSize: 16, lineHeight: 24 },
  form: { gap: theme.spacing.md },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  halfField: { flex: 1 },
  field: { gap: theme.spacing.sm },
  fieldLabel: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  input: { minHeight: 56, paddingHorizontal: theme.spacing.md, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 17, lineHeight: 23 },
  categoryHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  categoryPickerContainer: { minHeight: 56, borderRadius: theme.radii.sm, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center', overflow: 'hidden', paddingHorizontal: theme.spacing.sm },
  categoryPicker: { width: '100%', height: 56, borderWidth: 0, borderColor: 'transparent', backgroundColor: 'transparent', color: theme.colors.text, fontSize: 17, paddingHorizontal: theme.spacing.sm },
  errorMessage: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radii.sm, backgroundColor: '#FFF1F0' },
  errorMessageText: { flex: 1, color: '#B42318', fontSize: 14, lineHeight: 20 },
  storeMessage: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radii.sm, backgroundColor: '#E8F5F0' },
  storeMessageText: { flex: 1, color: '#236B54', fontSize: 14, lineHeight: 20 },
  actions: { gap: theme.spacing.sm, paddingBottom: theme.spacing.md },
  cancelButton: { minHeight: 56, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
  cancelButtonText: { color: theme.colors.text, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
