import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/tokens';

type FeatureRowProps = { emoji: string; title: string; description: string };

export function FeatureRow({ emoji, title, description }: FeatureRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.icon} accessible={false} aria-hidden>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 21 },
  copy: { flex: 1, gap: 2 },
  title: { color: theme.colors.onPrimary, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  description: { color: theme.colors.welcomeText, fontSize: 13, lineHeight: 18 },
});
