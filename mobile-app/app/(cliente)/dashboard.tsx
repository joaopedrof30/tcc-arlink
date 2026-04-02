import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function ClienteDashboard() {
  const router = useRouter();
  useEffect(() => { router.replace('/(cliente)/scanner'); }, []);
  return null;
}
