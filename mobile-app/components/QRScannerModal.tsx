import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface Props {
  visible: boolean;
  onScanned: (data: string) => void;
  onClose: () => void;
}

export default function QRScannerModal({ visible, onScanned, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => { if (visible) setScanned(false); }, [visible]);

  if (!permission) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Aponte para o QR Code</Text>

        {!permission.granted ? (
          <View style={styles.center}>
            <Text style={styles.permText}>Permissão de câmera necessária</Text>
            <TouchableOpacity style={styles.btn} onPress={requestPermission}>
              <Text style={styles.btnText}>Permitir câmera</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : ({ data }) => {
              setScanned(true);
              onScanned(data);
            }}
          />
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeTxt}>Fechar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', paddingTop: 56, paddingBottom: 16 },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permText: { color: '#fff', marginBottom: 16, fontSize: 16 },
  btn: { backgroundColor: '#1e40af', padding: 14, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  closeBtn: { backgroundColor: '#374151', padding: 18, alignItems: 'center' },
  closeTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
