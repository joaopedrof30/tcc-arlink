import { useRouter } from 'expo-router';
import { useEffect } from 'react';
export default function Manutencoes() {
  const router = useRouter();
  useEffect(() => { router.replace('/(tecnico)/dashboard'); }, []);
  return null;
}
