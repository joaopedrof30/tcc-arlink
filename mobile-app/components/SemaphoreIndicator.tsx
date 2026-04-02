import { View, Text, StyleSheet } from 'react-native';

interface Props {
  color: 'VERDE' | 'AMARELO' | 'VERMELHO';
  reason: string;
}

const COLORS = {
  VERMELHO: '#ef4444',
  AMARELO:  '#eab308',
  VERDE:    '#22c55e',
};

export default function SemaphoreIndicator({ color, reason }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.housing}>
        {(['VERMELHO', 'AMARELO', 'VERDE'] as const).map((c) => (
          <View
            key={c}
            style={[
              styles.light,
              { backgroundColor: COLORS[c], opacity: color === c ? 1 : 0.18 },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: COLORS[color] }]}>
        {color}
      </Text>
      <Text style={styles.reason}>{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
  housing: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 10,
    gap: 8,
    alignItems: 'center',
    width: 52,
  },
  light: { width: 28, height: 28, borderRadius: 14 },
  label: { fontWeight: '700', fontSize: 14, marginTop: 8, letterSpacing: 1 },
  reason: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4, paddingHorizontal: 8 },
});
