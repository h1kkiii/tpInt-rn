import { useRouter } from 'expo-router';
import { useCallback } from 'react';

// Cierra el modal; si se abrió por deep link y no hay nada debajo, va al Catálogo.
export function useCerrarModal() {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);
}
