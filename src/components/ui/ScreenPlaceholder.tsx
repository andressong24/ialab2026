import Feather from '@expo/vector-icons/Feather';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/theme/tokens';

type ScreenPlaceholderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof Feather>['name'];
  plannedFeatures: readonly string[];
  hasHeader?: boolean;
  actions?: readonly { label: string; href: Href; variant?: 'primary' | 'secondary' }[];
};

export function ScreenPlaceholder({
  eyebrow = 'YOUR FINANCES, SIMPLIFIED',
  title,
  description,
  icon,
  plannedFeatures,
  hasHeader,
  actions = [],
}: ScreenPlaceholderProps) {
  const router = useRouter();

  return (
    <Screen hasHeader={hasHeader}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.icon} accessible={false} aria-hidden>
          <Feather name={icon} size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>Coming next</Text>
        </View>
        <Text accessibilityRole="header" style={styles.cardTitle}>A little more clarity is on its way.</Text>
        <Text style={styles.description}>This screen is a placeholder. Here’s what you’ll be able to do:</Text>
        <View style={styles.featureList}>
          {plannedFeatures.map((feature) => (
            <View key={feature} style={styles.feature}>
              <Feather accessible={false} aria-hidden name="circle" size={6} color={theme.colors.primary} style={styles.bullet} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        {actions.map(({ label, href, variant }) => (
          <Button key={label} label={label} variant={variant} onPress={() => router.navigate(href)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.sm, paddingTop: theme.spacing.md },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '700', color: theme.colors.text, letterSpacing: -1 },
  description: { fontSize: 15, lineHeight: 23, color: theme.colors.textMuted },
  card: { padding: theme.spacing.lg, borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },
  icon: { width: 64, height: 64, borderRadius: theme.radii.md, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: theme.spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  badgeText: { fontSize: 12, fontWeight: '600', color: theme.colors.success },
  cardTitle: { fontSize: 23, lineHeight: 30, fontWeight: '700', letterSpacing: -0.5, color: theme.colors.text },
  featureList: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
  feature: { flexDirection: 'row', gap: theme.spacing.sm },
  bullet: { marginTop: 7 },
  featureText: { flex: 1, color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  actions: { gap: theme.spacing.sm },
});
