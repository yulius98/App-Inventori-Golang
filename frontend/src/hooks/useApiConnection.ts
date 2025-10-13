import { useEffect, useState } from 'react';
import { testApiConnection } from '@/lib/api';

export type ApiStatus = 'checking...' | 'connected' | 'disconnected' | 'error';

export function useApiConnection(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>('checking...');

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const ok = await testApiConnection();
        if (!mounted) return;
        setStatus(ok ? 'connected' : 'disconnected');
      } catch {
        if (!mounted) return;
        setStatus('error');
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  return status;
}
