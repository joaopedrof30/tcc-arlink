import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import QRScannerModal from '../../components/QRScannerModal';
import SemaphoreIndicator from '../../components/SemaphoreIndicator';
import { scanQRCode } from '../../services/api';

export default function ScannerScreen() {
  const { user, logout } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScanned = async (qrCodeId: string) => {
    setShowScanner(false);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await scanQRCode(qrCodeId);
      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Dispositivo não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const statusMsg: Record<string, string> = {
    VERDE: '✅ Ar-condicionado funcionando normalmente!',
    AMARELO: '⚠️ Manutenção preventiva recomendada em breve.',
    VERMELHO: '🚨 Problema crítico detectado! Contate a manutenção.',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Olá, {user?.username} 👋</Text>
        <TouchableOpacity onPress={logout}><Text style={styles.logout}>Sair</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
        <Text style={styles.scanIcon}>📷</Text>
        <Text style={styles.scanText}>Escanear QR Code do Ar-Condicionado</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 40 }} />}

      {error ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
      ) : null}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.deviceName}>{result.name}</Text>
          <Text style={styles.deviceMeta}>{result.location}</Text>
          <Text style={styles.deviceMeta}>{result.brand} · {result.model_name}</Text>

          <View style={styles.semaphoreBox}>
            <SemaphoreIndicator
              color={result.semaphore_color}
              reason={result.semaphore_reason}
            />
          </View>

          <View style={[styles.msgBox, {
            backgroundColor:
              result.semaphore_color === 'VERDE' ? '#f0fdf4' :
              result.semaphore_color === 'AMARELO' ? '#fefce8' : '#fef2f2'
          }]}>
            <Text style={styles.msgText}>{statusMsg[result.semaphore_color]}</Text>
          </View>
        </View>
      )}

      <QRScannerModal
        visible={showScanner}
        onScanned={handleScanned}
        onClose={() => setShowScanner(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#1e40af' },
  logout: { color: '#6b7280', fontSize: 14 },
  scanBtn: { backgroundColor: '#1e40af', borderRadius: 14, padding: 24, alignItems: 'center', gap: 8 },
  scanIcon: { fontSize: 40 },
  scanText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 14, marginTop: 16 },
  errorText: { color: '#dc2626', textAlign: 'center' },
  resultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginTop: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  deviceName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  deviceMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  semaphoreBox: { alignItems: 'center', marginVertical: 20 },
  msgBox: { borderRadius: 10, padding: 14, marginTop: 4 },
  msgText: { fontSize: 14, textAlign: 'center', fontWeight: '500', color: '#374151' },
});
