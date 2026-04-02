import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SemaphoreIndicator from './SemaphoreIndicator';

interface Device {
  id: number;
  name: string;
  location?: string;
  model_name?: string;
  brand?: string;
  status: 'VERDE' | 'AMARELO' | 'VERMELHO';
  total_hours_used: number;
}

interface Props {
  device: Device;
  onPress: () => void;
}

const STATUS_REASON: Record<string, string> = {
  VERDE: 'Operando normalmente.',
  AMARELO: 'Atenção necessária.',
  VERMELHO: 'Falha crítica detectada.',
};

export default function DeviceCard({ device, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{device.name}</Text>
          <Text style={styles.meta}>{device.location}</Text>
          <Text style={styles.meta}>{device.brand} · {device.model_name}</Text>
          <Text style={styles.hours}>⏱ {device.total_hours_used?.toFixed(0)}h de uso</Text>
        </View>
        <SemaphoreIndicator
          color={device.status as any}
          reason={STATUS_REASON[device.status] || ''}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1, paddingRight: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  hours: { fontSize: 13, color: '#1e40af', marginTop: 6, fontWeight: '500' },
});
