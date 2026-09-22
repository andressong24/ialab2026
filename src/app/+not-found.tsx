import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme/tokens';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen hasHeader>
      <View style={styles.icon} accessible={false} aria-hidden>
        <Feather name="compass" size={32} color={theme.colors.primary} />
      </View>
      <Text style={styles.eyebrow}>404 · SCREEN NOT FOUND</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Let’s get you back on track.
      </Text>
      <Text style={styles.description}>
        This link doesn’t match a screen in the app. Head home to keep exploring.
      </Text>
      <Button label="Go to home" onPress={() => router.navigate(routes.home)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 72,
    height: 72,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
});
