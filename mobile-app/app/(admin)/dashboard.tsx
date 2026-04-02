import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import DeviceCard from '../../components/DeviceCard';
import { getAllDevices, getPendingAlerts } from '../../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [devRes, altRes] = await Promise.all([getAllDevices(), getPendingAlerts()]);
      setDevices(devRes.data);
      setAlerts(altRes.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const verde   = devices.filter(d => d.status === 'VERDE').length;
  const amarelo = devices.filter(d => d.status === 'AMARELO').length;
  const vermelho = devices.filter(d => d.status === 'VERMELHO').length;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1e40af" /></View>;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Painel Admin</Text>
          <Text style={styles.sub}>{user?.username}</Text>
        </View>
        <TouchableOpacity onPress={logout}><Text style={styles.logout}>Sair</Text></TouchableOpacity>
      </View>

      {/* Cards de resumo */}
      <View style={styles.cards}>
        <View style={[styles.card, { borderTopColor: '#1e40af' }]}>
          <Text style={styles.cardNum}>{devices.length}</Text>
          <Text style={styles.cardLbl}>Total</Text>
        </View>
        <View style={[styles.card, { borderTopColor: '#22c55e' }]}>
          <Text style={[styles.cardNum, { color: '#22c55e' }]}>{verde}</Text>
          <Text style={styles.cardLbl}>🟢 Verde</Text>
        </View>
        <View style={[styles.card, { borderTopColor: '#eab308' }]}>
          <Text style={[styles.cardNum, { color: '#eab308' }]}>{amarelo}</Text>
          <Text style={styles.cardLbl}>🟡 Amarelo</Text>
        </View>
        <View style={[styles.card, { borderTopColor: '#ef4444' }]}>
          <Text style={[styles.cardNum, { color: '#ef4444' }]}>{vermelho}</Text>
          <Text style={styles.cardLbl}>🔴 Vermelho</Text>
        </View>
      </View>

      {/* Alertas pendentes */}
      {alerts.length > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>🚨 {alerts.length} alerta{alerts.length > 1 ? 's' : ''} crítico{alerts.length > 1 ? 's' : ''} pendente{alerts.length > 1 ? 's' : ''}</Text>
          <Text style={styles.alertSub}>Verifique o painel do técnico para resolver.</Text>
        </View>
      )}

      {/* Lista de dispositivos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Todos os Dispositivos</Text>
        {devices.map(d => (
          <DeviceCard key={d.id} device={d} onPress={() => {}} />
        ))}
        {devices.length === 0 && <Text style={styles.empty}>Nenhum dispositivo cadastrado.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1e40af', padding: 20, paddingTop: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sub: { color: '#bfdbfe', fontSize: 13, marginTop: 2 },
  logout: { color: '#bfdbfe', fontSize: 14 },
  cards: { flexDirection: 'row', padding: 16, gap: 10 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', borderTopWidth: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardNum: { fontSize: 24, fontWeight: '800', color: '#111827' },
  cardLbl: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  alertBox: { backgroundColor: '#fef2f2', marginHorizontal: 16, borderRadius: 10, padding: 14, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  alertTitle: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
  alertSub: { color: '#b91c1c', fontSize: 12, marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#9ca3af' },
});
