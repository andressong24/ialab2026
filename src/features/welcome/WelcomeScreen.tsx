import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import type { OnboardingExpense, OnboardingPriorityId, PayFrequency } from '@/state';
import { useFinanceStore } from '@/state';
import { theme } from '@/theme/tokens';

type IconName = ComponentProps<typeof Feather>['name'];
type Step = 1 | 2 | 3 | 4 | 5 | 6;
type Frequency = PayFrequency;

type Priority = {
  id: OnboardingPriorityId;
  title: string;
  description: string;
  icon: IconName;
};

const priorities: readonly Priority[] = [
  { id: 'spending', title: 'Control spending', description: 'Know what’s left before you buy', icon: 'credit-card' },
  { id: 'savings', title: 'Build savings', description: 'Create a cushion for the unexpected', icon: 'briefcase' },
  { id: 'debt', title: 'Pay down debt', description: 'Make steady progress on balances', icon: 'credit-card' },
  { id: 'goals', title: 'Plan goals', description: 'Save for travel, education, or a big purchase', icon: 'check' },
];

const frequencies: readonly { id: Frequency; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'twice-monthly', label: 'Twice a month' },
  { id: 'monthly', label: 'Monthly' },
];

function parseAmountCents(value: string) {
  const amount = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function formatCurrency(amountCents: number, decimals = 0) {
  return (amountCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatInputCents(amountCents: number) {
  return (amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function AppFrame({ children }: { children: ReactNode }) {
  return (
    <View style={styles.appBackground}>
      <SafeAreaView style={styles.page} edges={['top', 'bottom', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

function Progress({ step }: { step: Step }) {
  return (
    <View style={styles.progress} accessibilityLabel={`Step ${step} of 6`}>
      {Array.from({ length: 6 }, (_, index) => (
        <View key={index} style={[styles.progressSegment, index < step && styles.progressSegmentActive]} />
      ))}
    </View>
  );
}

function StepHeader({ step, onBack }: { step: Exclude<Step, 1>; onBack: () => void }) {
  return (
    <View style={styles.stepHeader}>
      <View style={styles.stepTopRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Feather name="chevron-left" size={22} color={theme.colors.textMuted} />
        </Pressable>
        <Text style={styles.stepLabel}>Step {step} of 6</Text>
      </View>
      <Progress step={step} />
    </View>
  );
}

function StepLayout({
  step,
  onBack,
  onContinue,
  children,
  continueLabel = 'Continue',
  continueHint,
}: {
  step: Exclude<Step, 1>;
  onBack: () => void;
  onContinue: () => void;
  children: ReactNode;
  continueLabel?: string;
  continueHint?: string;
}) {
  return (
    <AppFrame>
      <KeyboardAvoidingView
        style={styles.stepFrame}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.stepContent}>
          <StepHeader step={step} onBack={onBack} />
          {children}
        </ScrollView>
        <View style={styles.stepFooter}>
          <Button label={continueLabel} accessibilityHint={continueHint} onPress={onContinue} />
        </View>
      </KeyboardAvoidingView>
    </AppFrame>
  );
}

function CheckTile() {
  return (
    <View style={styles.checkTile} accessible={false} aria-hidden>
      <Feather name="check" size={22} color={theme.colors.accent} />
    </View>
  );
}

function IntroStep({ onContinue }: { onContinue: () => void }) {
  const { height } = useWindowDimensions();

  return (
    <AppFrame>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.introContent, height < 820 && styles.introContentCompact]}>
        <View style={styles.introHero}>
          <View style={styles.walletTile} accessible={false} aria-hidden>
            <Feather name="credit-card" size={34} color={theme.colors.text} />
          </View>
          <Text accessibilityRole="header" style={styles.introTitle}>
            A calmer way to manage your{ '\n' }money
          </Text>
          <Text style={styles.introSubtitle}>
            Build a monthly plan, stay ahead of bills, and make steady progress toward what matters.
          </Text>
        </View>

        <View style={styles.introBenefits}>
          <BenefitRow title="Plan with confidence" description="See what is safe to spend each month" />
          <BenefitRow title="Save on purpose" description="Turn priorities into realistic targets" />
        </View>
      </ScrollView>
      <View style={styles.introFooter}>
        <Button label="Get started" accessibilityHint="Moves to financial priorities" onPress={onContinue} />
        <Pressable accessibilityRole="link" accessibilityLabel="I already have an account. Sign in">
          <Text style={styles.signIn}>I already have an account · Sign in</Text>
        </Pressable>
      </View>
    </AppFrame>
  );
}

function BenefitRow({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.benefitRow}>
      <CheckTile />
      <View style={styles.benefitCopy}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
      <Feather name="check" size={20} color={theme.colors.text} accessible={false} aria-hidden />
    </View>
  );
}

function PrioritiesStep({
  selected,
  onToggle,
  onBack,
  onContinue,
}: {
  selected: Set<OnboardingPriorityId>;
  onToggle: (id: OnboardingPriorityId) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <StepLayout step={2} onBack={onBack} onContinue={onContinue}>
      <View style={styles.stepCopy}>
        <Text accessibilityRole="header" style={styles.stepTitle}>What matters most right now?</Text>
        <Text style={styles.stepDescription}>Choose all that apply. We’ll shape your starter plan around these priorities.</Text>
      </View>
      <View style={styles.priorityList}>
        {priorities.map((priority) => {
          const isSelected = selected.has(priority.id);
          return (
            <Pressable
              key={priority.id}
              accessibilityRole="button"
              accessibilityLabel={priority.title}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onToggle(priority.id)}
              style={({ pressed }) => [
                styles.priorityCard,
                isSelected && styles.priorityCardSelected,
                pressed && styles.pressed,
              ]}>
              <View style={[styles.priorityIcon, isSelected ? styles.priorityIconSelected : styles.priorityIconUnselected]}>
                <Feather name={priority.icon} size={25} color={isSelected ? theme.colors.accent : theme.colors.onPrimary} />
              </View>
              <View style={styles.priorityCopy}>
                <Text style={styles.priorityTitle}>{priority.title}</Text>
                <Text style={styles.priorityDescription}>{priority.description}</Text>
              </View>
              {isSelected ? <Feather name="check" size={20} color={theme.colors.text} /> : null}
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.selectionNote}>{selected.size} selected · You can update priorities anytime</Text>
    </StepLayout>
  );
}

function IncomeStep({
  incomeInput,
  incomeCents,
  frequency,
  onIncomeChange,
  onFrequencyChange,
  onBack,
  onContinue,
}: {
  incomeInput: string;
  incomeCents: number;
  frequency: Frequency;
  onIncomeChange: (value: string) => void;
  onFrequencyChange: (value: Frequency) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [showFrequencies, setShowFrequencies] = useState(false);
  const divisor = frequency === 'weekly' ? 4.33 : frequency === 'twice-monthly' ? 2 : 1;
  const paycheckCents = Math.round(incomeCents / divisor);
  const selectedFrequency = frequencies.find((option) => option.id === frequency)?.label;

  return (
    <StepLayout step={3} onBack={onBack} onContinue={onContinue}>
      <View style={styles.stepCopy}>
        <Text accessibilityRole="header" style={styles.stepTitle}>Start with your take-home income</Text>
        <Text style={styles.stepDescription}>Use the amount that reaches your account after taxes and deductions.</Text>
      </View>
      <View style={styles.incomeCard}>
        <View style={styles.sectionHeading}>
          <Feather name="credit-card" size={28} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>Your income</Text>
        </View>
        <Text style={styles.fieldLabel}>Monthly take-home income</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput
            accessibilityLabel="Monthly take-home income"
            value={incomeInput}
            onChangeText={onIncomeChange}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            selectTextOnFocus
          />
          <Text style={styles.inputSuffix}>USD</Text>
        </View>
        <Text style={styles.fieldLabel}>Pay frequency</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pay frequency: ${selectedFrequency}`}
          accessibilityState={{ expanded: showFrequencies }}
          onPress={() => setShowFrequencies((visible) => !visible)}
          style={styles.frequencyField}>
          <Text style={styles.frequencyValue}>{selectedFrequency}</Text>
          <Feather name={showFrequencies ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} />
        </Pressable>
        {showFrequencies ? (
          <View style={styles.frequencyOptions}>
            {frequencies.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                onPress={() => {
                  onFrequencyChange(option.id);
                  setShowFrequencies(false);
                }}
                style={styles.frequencyOption}>
                <Text style={styles.frequencyValue}>{option.label}</Text>
                {option.id === frequency ? <Feather name="check" size={18} color={theme.colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={styles.paycheckSummary}>
          <Text style={styles.paycheckLabel}>Estimated per paycheck</Text>
          <Text style={styles.paycheckAmount}>{formatCurrency(paycheckCents)}</Text>
        </View>
      </View>
      <Text style={styles.helperText}>Income can vary? Enter your dependable monthly minimum for a safer plan.</Text>
    </StepLayout>
  );
}

function RecurringExpensesStep({
  expenses,
  onExpensesChange,
  onBack,
  onContinue,
}: {
  expenses: readonly OnboardingExpense[];
  onExpensesChange: (expenses: readonly OnboardingExpense[]) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftAmount, setDraftAmount] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const totalCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  const openEditor = (expense?: OnboardingExpense) => {
    setEditingId(expense?.id ?? 'new');
    setDraftName(expense?.name ?? '');
    setDraftAmount(expense ? String(expense.amountCents / 100) : '');
    setDraftDescription(expense?.description ?? 'Monthly estimate');
  };

  const saveEditor = () => {
    const name = draftName.trim();
    const amountCents = parseAmountCents(draftAmount);
    if (!name || amountCents <= 0 || !editingId) return;

    if (editingId === 'new') {
      onExpensesChange([
        ...expenses,
        { id: `expense-${Date.now()}`, name, description: draftDescription.trim() || 'Monthly estimate', amountCents, categoryId: 'home' },
      ]);
    } else {
      onExpensesChange(expenses.map((expense) => (
        expense.id === editingId
          ? { ...expense, name, description: draftDescription.trim() || 'Monthly estimate', amountCents }
          : expense
      )));
    }
    setEditingId(null);
  };

  return (
    <StepLayout step={4} onBack={onBack} onContinue={onContinue}>
      <View style={styles.stepCopy}>
        <Text accessibilityRole="header" style={styles.stepTitle}>Add your monthly essentials</Text>
        <Text style={styles.stepDescription}>Start with what you remember. Skip anything uncertain. You can edit everything later.</Text>
      </View>
      <View style={styles.expenseList}>
        {expenses.map((expense) => (
          <View key={expense.id}>
            <View style={styles.expenseCard}>
              <View style={styles.expenseCopy}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
              </View>
                <Text style={styles.expenseAmount}>{formatCurrency(expense.amountCents)}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${expense.name}`}
                onPress={() => openEditor(expense)}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
                <Feather name="edit-2" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            {editingId === expense.id ? (
              <ExpenseEditor
                name={draftName}
                amount={draftAmount}
                description={draftDescription}
                onNameChange={setDraftName}
                onAmountChange={setDraftAmount}
                onDescriptionChange={setDraftDescription}
                onCancel={() => setEditingId(null)}
                onSave={saveEditor}
              />
            ) : null}
          </View>
        ))}
      </View>
      <View style={styles.essentialsSummary}>
        <View>
          <Text style={styles.summaryLabel}>Monthly essentials</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalCents)}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add expense" onPress={() => openEditor()}>
          <Text style={styles.addExpenseText}>+ Add expense</Text>
        </Pressable>
      </View>
      {editingId === 'new' ? (
        <ExpenseEditor
          name={draftName}
          amount={draftAmount}
          description={draftDescription}
          onNameChange={setDraftName}
          onAmountChange={setDraftAmount}
          onDescriptionChange={setDraftDescription}
          onCancel={() => setEditingId(null)}
          onSave={saveEditor}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add another expense"
          onPress={() => openEditor()}
          style={({ pressed }) => [styles.addAnotherCard, pressed && styles.pressed]}>
          <View>
            <Text style={styles.addAnotherTitle}>Add another expense</Text>
            <Text style={styles.expenseDescription}>Add a bill, subscription, or savings goal now.</Text>
          </View>
          <View style={styles.addAnotherAction}>
            <Feather name="plus" size={24} color={theme.colors.text} />
            <Text style={styles.addExpenseText}>Add</Text>
          </View>
        </Pressable>
      )}
    </StepLayout>
  );
}

function ExpenseEditor({
  name,
  amount,
  description,
  onNameChange,
  onAmountChange,
  onDescriptionChange,
  onCancel,
  onSave,
}: {
  name: string;
  amount: string;
  description: string;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.expenseEditor}>
      <Text style={styles.editorTitle}>Edit expense</Text>
      <TextInput accessibilityLabel="Expense name" value={name} onChangeText={onNameChange} placeholder="Expense name" style={styles.editorInput} />
      <TextInput accessibilityLabel="Expense amount" value={amount} onChangeText={onAmountChange} placeholder="Amount" keyboardType="decimal-pad" style={styles.editorInput} />
      <TextInput accessibilityLabel="Expense description" value={description} onChangeText={onDescriptionChange} placeholder="Description" style={styles.editorInput} />
      <View style={styles.editorActions}>
        <Button label="Cancel" variant="secondary" onPress={onCancel} />
        <Button label="Save expense" onPress={onSave} disabled={!name.trim() || parseAmountCents(amount) <= 0} />
      </View>
    </View>
  );
}

function AllocationsStep({
  incomeCents,
  expenses,
  onBack,
  onContinue,
}: {
  incomeCents: number;
  expenses: readonly OnboardingExpense[];
  onBack: () => void;
  onContinue: () => void;
}) {
  const essentialsCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
  const allocations = [
    { title: 'Home & essentials', description: 'Rent, bills, groceries, transport', amountCents: essentialsCents },
    { title: 'Everyday spending', description: 'Dining, activities, personal', amountCents: 74_000 },
    { title: 'Debt payments', description: 'Student loan plus extra payment', amountCents: 55_000 },
    { title: 'Monthly savings target', description: 'Emergency fund and goals', amountCents: 65_000 },
  ];
  const plannedCents = allocations.reduce((sum, allocation) => sum + allocation.amountCents, 0);
  const bufferCents = Math.max(incomeCents - plannedCents, 0);
  const bufferPercent = incomeCents > 0 ? Math.round((bufferCents / incomeCents) * 100) : 0;

  return (
    <StepLayout step={5} onBack={onBack} onContinue={onContinue} continueLabel="Review my plan">
      <View style={styles.stepCopy}>
        <Text accessibilityRole="header" style={styles.stepTitle}>Give every dollar a job</Text>
        <Text style={styles.stepDescription}>Set flexible spending and savings. We’ll keep the plan balanced as you adjust.</Text>
      </View>
      <View style={styles.allocationList}>
        {allocations.map((allocation) => (
          <View key={allocation.title} style={styles.allocationCard}>
            <View>
              <Text style={styles.allocationTitle}>{allocation.title}</Text>
              <Text style={styles.expenseDescription}>{allocation.description}</Text>
            </View>
              <Text style={styles.expenseAmount}>{formatCurrency(allocation.amountCents)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Budget balance</Text>
        <View style={styles.balanceGrid}>
          <Metric label="Income" value={formatCurrency(incomeCents)} />
          <Metric label="Planned" value={formatCurrency(plannedCents)} />
          <Metric label="Buffer" value={formatCurrency(bufferCents)} valueColor={theme.colors.primary} />
        </View>
        <Text style={styles.balanceNote}>Balanced · {bufferPercent}% left as a monthly cushion</Text>
      </View>
    </StepLayout>
  );
}

function CompleteStep({
  incomeCents,
  expenses,
  onBack,
}: {
  incomeCents: number;
  expenses: readonly OnboardingExpense[];
  onBack: () => void;
}) {
  const essentialsCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
  const plannedCents = essentialsCents + 74_000 + 55_000 + 65_000;
  const bufferCents = Math.max(incomeCents - plannedCents, 0);

  return (
    <StepLayout
      step={6}
      onBack={onBack}
      onContinue={() => undefined}
      continueLabel="Open my dashboard"
      continueHint="Dashboard navigation will be connected in a later phase">
      <View style={styles.stepCopy}>
        <Text accessibilityRole="header" style={styles.stepTitle}>Your plan is ready, Maya</Text>
        <Text style={styles.stepDescription}>A clear starting point based on your income, essentials, and priorities.</Text>
      </View>
      <View style={styles.completeIcon} accessible={false} aria-hidden>
        <Feather name="check" size={34} color={theme.colors.text} />
      </View>
      <View style={styles.monthlyPlanCard}>
        <View style={styles.planTitleRow}>
          <Text style={styles.planTitle}>Your monthly plan</Text>
          <Text style={styles.readyLabel}>Ready</Text>
        </View>
        <Text style={styles.planIncome}>{formatCurrency(incomeCents)} income</Text>
        <View style={styles.planMetrics}>
          <Metric label="Essentials" value={formatCurrency(essentialsCents)} />
          <Metric label="Savings" value={formatCurrency(65_000)} valueColor={theme.colors.primary} />
          <Metric label="Buffer" value={formatCurrency(bufferCents)} valueColor={theme.colors.primary} />
        </View>
      </View>
      <View style={styles.completeBenefits}>
        <BenefitRow title="Spending is under control" description="$740 set aside for flexible spending" />
        <BenefitRow title="Savings starts automatically" description="$650 monthly toward your cushion and goals" />
      </View>
      <Text style={styles.helperText}>We’ll check in after your first week. Adjust anything anytime.</Text>
    </StepLayout>
  );
}

function Metric({ label, value, valueColor = theme.colors.text }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function WelcomeScreen() {
  const { state, actions } = useFinanceStore();
  const [step, setStep] = useState<Step>(1);
  const [incomeInput, setIncomeInput] = useState(() => formatInputCents(state.onboarding.monthlyIncomeCents));

  const goBack = () => setStep((current) => (current > 1 ? (current - 1) as Step : current));
  const selectedPriorities = new Set(state.onboarding.priorities);

  const togglePriority = (id: OnboardingPriorityId) => {
    const next = new Set(selectedPriorities);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    actions.setPriorities([...next].filter((priority): priority is OnboardingPriorityId => (
      priority === 'spending' || priority === 'savings' || priority === 'debt' || priority === 'goals'
    )));
  };

  const updateIncome = (value: string) => {
    setIncomeInput(value);
    actions.setMonthlyIncomeCents(parseAmountCents(value));
  };

  if (step === 1) return <IntroStep onContinue={() => setStep(2)} />;
  if (step === 2) {
    return (
      <PrioritiesStep
        selected={selectedPriorities}
        onToggle={togglePriority}
        onBack={goBack}
        onContinue={() => setStep(3)}
      />
    );
  }
  if (step === 3) {
    return (
      <IncomeStep
        incomeInput={incomeInput}
        incomeCents={state.onboarding.monthlyIncomeCents}
        frequency={state.onboarding.payFrequency}
        onIncomeChange={updateIncome}
        onFrequencyChange={actions.setPayFrequency}
        onBack={goBack}
        onContinue={() => setStep(4)}
      />
    );
  }
  if (step === 4) {
    return <RecurringExpensesStep expenses={state.onboarding.recurringExpenses} onExpensesChange={actions.setRecurringExpenses} onBack={goBack} onContinue={() => setStep(5)} />;
  }
  if (step === 5) {
    return <AllocationsStep incomeCents={state.onboarding.monthlyIncomeCents} expenses={state.onboarding.recurringExpenses} onBack={goBack} onContinue={() => setStep(6)} />;
  }
  return <CompleteStep incomeCents={state.onboarding.monthlyIncomeCents} expenses={state.onboarding.recurringExpenses} onBack={goBack} />;
}

const styles = StyleSheet.create({
  appBackground: { flex: 1, alignItems: 'center', backgroundColor: '#E9E9EA' },
  page: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: theme.colors.background },
  pressed: { opacity: 0.7 },
  stepFrame: { flex: 1 },
  stepContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 20 },
  stepFooter: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, backgroundColor: theme.colors.background },
  stepHeader: { gap: 12 },
  stepTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 50, height: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  stepLabel: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  progress: { flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 7, borderRadius: 5, backgroundColor: '#E8E9ED' },
  progressSegmentActive: { backgroundColor: theme.colors.success },
  stepCopy: { gap: 6 },
  stepTitle: { color: theme.colors.text, fontSize: 28, lineHeight: 33, fontWeight: '800', letterSpacing: -1 },
  stepDescription: { color: theme.colors.textMuted, fontSize: 17, lineHeight: 23 },
  introContent: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 140, paddingBottom: 24, gap: 28 },
  introContentCompact: { paddingTop: 64, gap: 20 },
  introHero: { alignItems: 'center', gap: 18 },
  walletTile: { width: 112, height: 112, borderRadius: 34, backgroundColor: '#E8F5EE', alignItems: 'center', justifyContent: 'center' },
  introTitle: { maxWidth: 380, color: theme.colors.text, fontSize: 28, lineHeight: 34, textAlign: 'center', fontWeight: '800', letterSpacing: -1.1 },
  introSubtitle: { maxWidth: 370, color: theme.colors.textMuted, fontSize: 18, lineHeight: 25, textAlign: 'center' },
  introBenefits: { gap: 12, marginHorizontal: 8 },
  benefitRow: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 13, backgroundColor: '#F7FCF5', borderWidth: 1.5, borderColor: theme.colors.primary },
  checkTile: { width: 62, height: 62, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9ECFC' },
  benefitCopy: { flex: 1, gap: 3 },
  benefitTitle: { color: theme.colors.text, fontSize: 18, lineHeight: 23, fontWeight: '600' },
  benefitDescription: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 20 },
  introFooter: { gap: 12, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, backgroundColor: theme.colors.background },
  signIn: { color: theme.colors.primary, fontSize: 17, lineHeight: 22, fontWeight: '600', textAlign: 'center' },
  priorityList: { gap: 12 },
  priorityCard: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 13, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#ECEDEF' },
  priorityCardSelected: { backgroundColor: '#F7FCF5', borderColor: theme.colors.primary },
  priorityIcon: { width: 62, height: 62, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  priorityIconSelected: { backgroundColor: '#E9ECFC' },
  priorityIconUnselected: { backgroundColor: theme.colors.text },
  priorityCopy: { flex: 1, gap: 3 },
  priorityTitle: { color: theme.colors.text, fontSize: 18, lineHeight: 23, fontWeight: '600' },
  priorityDescription: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 20 },
  selectionNote: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 20 },
  incomeCard: { padding: 20, gap: 12, backgroundColor: theme.colors.surface, borderRadius: 13, borderWidth: 1, borderColor: '#ECEDEF' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  sectionTitle: { color: theme.colors.text, fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -1 },
  fieldLabel: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  inputRow: { minHeight: 61, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#DCDDE1' },
  inputPrefix: { color: theme.colors.text, fontSize: 18, fontWeight: '600' },
  amountInput: { flex: 1, minWidth: 0, color: theme.colors.text, fontSize: 19, fontWeight: '600', paddingVertical: 12, paddingHorizontal: 3 },
  inputSuffix: { color: theme.colors.textMuted, fontSize: 15 },
  frequencyField: { minHeight: 61, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#DCDDE1' },
  frequencyValue: { color: theme.colors.text, fontSize: 18, lineHeight: 22, fontWeight: '600' },
  frequencyOptions: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, overflow: 'hidden' },
  frequencyOption: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  paycheckSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 15, borderRadius: 12, backgroundColor: '#F1F9EF' },
  paycheckLabel: { color: theme.colors.textMuted, fontSize: 20, lineHeight: 25, fontWeight: '600' },
  paycheckAmount: { color: theme.colors.primary, fontSize: 20, lineHeight: 25, fontWeight: '700' },
  helperText: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 22 },
  expenseList: { gap: 12 },
  expenseCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 13, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#ECEDEF' },
  expenseCopy: { flex: 1, gap: 2 },
  expenseName: { color: theme.colors.text, fontSize: 18, lineHeight: 23, fontWeight: '600' },
  expenseDescription: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 20 },
  expenseAmount: { color: theme.colors.text, fontSize: 17, lineHeight: 22, fontWeight: '600' },
  editButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  essentialsSummary: { minHeight: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 15, borderRadius: 13, backgroundColor: '#F1F9EF', borderWidth: 1, borderColor: '#E2EFE0' },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 19 },
  summaryAmount: { color: theme.colors.text, fontSize: 22, lineHeight: 28, fontWeight: '800' },
  addExpenseText: { color: theme.colors.primary, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  addAnotherCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 13, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#ECEDEF' },
  addAnotherTitle: { color: theme.colors.text, fontSize: 18, lineHeight: 23, fontWeight: '600' },
  addAnotherAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseEditor: { gap: 10, marginTop: 8, padding: 14, borderRadius: 13, backgroundColor: '#F5F7F4', borderWidth: 1, borderColor: '#E0E9DE' },
  editorTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  editorInput: { minHeight: 45, paddingHorizontal: 12, borderRadius: 10, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, fontSize: 16 },
  editorActions: { flexDirection: 'row', gap: 8 },
  allocationList: { gap: 12 },
  allocationCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 13, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: '#ECEDEF' },
  allocationTitle: { color: theme.colors.text, fontSize: 18, lineHeight: 23, fontWeight: '600' },
  balanceCard: { gap: 20, padding: 20, borderRadius: 13, backgroundColor: '#F1F9EF', borderWidth: 1, borderColor: '#E2EFE0' },
  balanceTitle: { color: theme.colors.text, fontSize: 31, lineHeight: 36, fontWeight: '800', letterSpacing: -1 },
  balanceGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  metric: { flex: 1, gap: 3 },
  metricLabel: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 20 },
  metricValue: { color: theme.colors.text, fontSize: 20, lineHeight: 25, fontWeight: '700' },
  balanceNote: { color: theme.colors.primary, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  completeIcon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5EE' },
  monthlyPlanCard: { gap: 20, padding: 22, borderRadius: 13, backgroundColor: '#F1F9EF', borderWidth: 1, borderColor: '#E2EFE0' },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  planTitle: { flex: 1, color: theme.colors.text, fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -1 },
  readyLabel: { color: theme.colors.primary, fontSize: 16, lineHeight: 21, fontWeight: '600' },
  planIncome: { color: theme.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800' },
  planMetrics: { flexDirection: 'row', gap: 12 },
  completeBenefits: { gap: 12 },
});
