import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export const loginUser = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

export const scanQRCode = (qrCodeId: string) =>
  api.post('/devices/scan', { qr_code_id: qrCodeId });

export const getAllDevices = () => api.get('/devices');

export const getMaintenanceLogs = (deviceId: number) =>
  api.get(`/maintenance/device/${deviceId}`);

export const createMaintenanceLog = (data: {
  device_id: number;
  log_type: string;
  description: string;
}) => api.post('/maintenance', data);

export const resolveLog = (logId: number) =>
  api.put(`/maintenance/${logId}/resolve`);

export const getPendingAlerts = () => api.get('/alerts/pending');

export default api;