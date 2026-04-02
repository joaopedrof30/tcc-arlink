import { useRouter } from 'expo-router';
import { useEffect } from 'react';
export default function Users() {
  const router = useRouter();
  useEffect(() => { router.replace('/(admin)/dashboard'); }, []);
  return null;
}
