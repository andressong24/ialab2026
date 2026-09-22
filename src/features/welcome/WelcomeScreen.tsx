import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { FeatureRow } from '@/features/welcome/components/FeatureRow';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme/tokens';

const features = [
  { emoji: '📊', title: 'Smart Budgeting', description: 'Allocate income across categories effortlessly' },
  { emoji: '💸', title: 'Expense Tracking', description: 'Log every transaction with ease' },
  { emoji: '💵', title: 'Side Income', description: 'Track earnings from multiple sources' },
  { emoji: '🎯', title: 'Goal Planning', description: 'Set targets and watch your savings grow' },
  { emoji: '🤝', title: 'Split Expenses', description: 'Manage shared costs with friends & family' },
] as const;

export function WelcomeScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const compact = height < 740;

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={[theme.colors.welcomeTop, theme.colors.welcomeMiddle, theme.colors.welcomeBottom]}
        locations={[0, 0.48, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={styles.gradient}>
        <View pointerEvents="none" accessible={false} aria-hidden style={styles.decorations}>
          <View style={styles.circleLarge} />
          <View style={styles.circleSmall} />
        </View>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, compact && styles.contentCompact]}>
            <View style={styles.hero}>
              <View style={[styles.gemTile, compact && styles.gemTileCompact]} accessible={false} aria-hidden>
                <Text style={styles.gem}>💎</Text>
              </View>
              <Text accessibilityRole="header" style={[styles.heading, width < 360 && styles.headingNarrow]}>
                Take Control of Your{'\n'}Finances
              </Text>
              <Text style={styles.subtitle}>
                Budget smarter, track expenses, and reach your goals — all in one place.
              </Text>
            </View>
            <View style={styles.features}>
              {features.map((feature) => <FeatureRow key={feature.title} {...feature} />)}
            </View>
            <View style={styles.footer}>
              <Button
                label="Get Started"
                variant="inverse"
                icon="chevron-right"
                accessibilityHint="Opens budget setup"
                onPress={() => router.push(routes.budget)}
              />
              <Text style={styles.setupNote}>Takes about 2 minutes to set up</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#EEEDFC', alignItems: 'center' },
  gradient: { flex: 1, width: '100%', maxWidth: theme.layout.contentMaxWidth, overflow: 'hidden' },
  safeArea: { flex: 1 },
  decorations: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  circleLarge: { position: 'absolute', top: 42, right: 26, width: 162, height: 162, borderRadius: 81, backgroundColor: 'rgba(255,255,255,0.055)' },
  circleSmall: { position: 'absolute', top: 126, left: 16, width: 86, height: 86, borderRadius: 43, backgroundColor: 'rgba(255,255,255,0.045)' },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 42, paddingBottom: 24, justifyContent: 'center', gap: 28 },
  contentCompact: { paddingTop: 24, paddingBottom: 18, gap: 20 },
  hero: { alignItems: 'center' },
  gemTile: { width: 88, height: 88, borderRadius: 31, backgroundColor: 'rgba(255,255,255,0.17)', alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  gemTileCompact: { width: 76, height: 76, borderRadius: 27, marginBottom: 22 },
  gem: { fontSize: 40 },
  heading: { textAlign: 'center', fontSize: 31, lineHeight: 36, letterSpacing: -0.9, fontWeight: '800', color: theme.colors.onPrimary },
  headingNarrow: { fontSize: 26, lineHeight: 32 },
  subtitle: { maxWidth: 360, marginTop: 16, textAlign: 'center', fontSize: 15, lineHeight: 23, color: theme.colors.welcomeText },
  features: { padding: 18, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.13)', gap: 14 },
  footer: { gap: 13 },
  setupNote: { textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '500', color: theme.colors.welcomeMuted },
});
