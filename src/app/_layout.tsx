import Feather from '@expo/vector-icons/Feather';
import { Stack, usePathname, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet } from 'react-native';

import { routes } from '@/navigation/routes';
import { theme } from '@/theme/tokens';

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>IA Lab Finance</title>
        <meta name="description" content="Budget smarter, track expenses, and reach your goals — all in one place." />
      </Head>
      <StatusBar style={pathname === '/' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: ({ canGoBack, tintColor }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={canGoBack ? 'Go back' : 'Go to home'}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace(routes.home);
                }
              }}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Feather name="chevron-left" size={24} color={tintColor ?? theme.colors.text} />
            </Pressable>
          ),
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="expenses/new" options={{ title: 'Add expense' }} />
        <Stack.Screen
          name="expenses/receipt-review"
          options={{ title: 'Receipt review' }}
        />
        <Stack.Screen name="split-budget" options={{ title: 'Split budget' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Screen not found' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.sm,
  },
  pressed: { opacity: 0.55 },
});
