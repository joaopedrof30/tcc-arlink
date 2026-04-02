import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Modal, ScrollView, Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import DeviceCard from '../../components/DeviceCard';
import SemaphoreIndicator from '../../components/SemaphoreIndicator';
import { getAllDevices, getPendingAlerts, getMaintenanceLogs, resolveLog, createMaintenanceLog } from '../../services/api';

export default function TecnicoDashboard() {
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const load = useCallback(async () => {
    try {
      const [devRes, altRes] = await Promise.all([getAllDevices(), getPendingAlerts()]);
      setDevices(devRes.data);
      setAlerts(altRes.data);
    } catch (e) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const openDevice = async (device: any) => {
    setSelected(device);
    setLoadingLogs(true);
    try {
      const res = await getMaintenanceLogs(device.id);
      setLogs(res.data);
    } catch (_) {}
    finally { setLoadingLogs(false); }
  };

  const handleResolve = async (logId: number) => {
    try {
      await resolveLog(logId);
      const res = await getMaintenanceLogs(selected.id);
      setLogs(res.data);
      load();
    } catch (_) { Alert.alert('Erro', 'Não foi possível resolver o log.'); }
  };

  const STATUS_COLOR: any = { VERDE: '#22c55e', AMARELO: '#eab308', VERMELHO: '#ef4444' };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1e40af" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Técnico: {user?.username}</Text>
        <View style={styles.row}>
          {alerts.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{alerts.length} alerta{alerts.length > 1 ? 's' : ''}</Text></View>
          )}
          <TouchableOpacity onPress={logout}><Text style={styles.logout}>Sair</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <DeviceCard device={item} onPress={() => openDevice(item)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum dispositivo cadastrado.</Text>}
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selected?.name}</Text>
            <TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.closeBtn}>✕ Fechar</Text></TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.metaText}>{selected?.location}</Text>
            <Text style={styles.metaText}>{selected?.brand} · {selected?.model_name}</Text>
            <Text style={styles.metaText}>⏱ {selected?.total_hours_used?.toFixed(0)}h de uso</Text>

            <View style={styles.semBox}>
              <SemaphoreIndicator
                color={selected?.status}
                reason={selected?.status === 'VERDE' ? 'Operando normalmente.' : selected?.status === 'AMARELO' ? 'Atenção necessária.' : 'Falha crítica.'}
              />
            </View>

            <Text style={styles.sectionTitle}>Histórico de Manutenções</Text>

            {loadingLogs
              ? <ActivityIndicator color="#1e40af" />
              : logs.length === 0
                ? <Text style={styles.empty}>Nenhum registro ainda.</Text>
                : logs.map((log) => (
                    <View key={log.id} style={styles.logCard}>
                      <View style={styles.logRow}>
                        <Text style={styles.logType}>{log.log_type}</Text>
                        <View style={[styles.logStatus, { backgroundColor: log.resolved ? '#f0fdf4' : '#fef2f2' }]}>
                          <Text style={{ fontSize: 11, color: log.resolved ? '#16a34a' : '#dc2626' }}>
                            {log.resolved ? 'Resolvido' : 'Pendente'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.logDesc}>{log.description}</Text>
                      <Text style={styles.logDate}>{new Date(log.created_at).toLocaleString('pt-BR')}</Text>
                      {!log.resolved && (
                        <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(log.id)}>
                          <Text style={styles.resolveTxt}>Marcar como resolvido</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
            }
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1e40af', padding: 20, paddingTop: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  logout: { color: '#bfdbfe', fontSize: 14 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  modalHeader: { backgroundColor: '#1e40af', padding: 20, paddingTop: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1 },
  closeBtn: { color: '#bfdbfe', fontSize: 14 },
  modalBody: { padding: 20 },
  metaText: { color: '#6b7280', fontSize: 14, marginBottom: 2 },
  semBox: { alignItems: 'center', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
  logCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logType: { fontWeight: '700', color: '#1e40af', fontSize: 13 },
  logStatus: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  logDesc: { color: '#374151', fontSize: 13, marginBottom: 4 },
  logDate: { color: '#9ca3af', fontSize: 11 },
  resolveBtn: { backgroundColor: '#1e40af', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  resolveTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
