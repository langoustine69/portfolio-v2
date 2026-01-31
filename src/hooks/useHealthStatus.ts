'use client';

import { useState, useEffect, useCallback } from 'react';

export type HealthStatus = 'checking' | 'healthy' | 'unhealthy' | 'unknown';

interface HealthResult {
  status: HealthStatus;
  responseTime: number | null;
  lastChecked: Date | null;
}

export function useHealthStatus(endpoint: string | undefined, enabled: boolean = true): HealthResult {
  const [result, setResult] = useState<HealthResult>({
    status: endpoint ? 'checking' : 'unknown',
    responseTime: null,
    lastChecked: null,
  });

  const checkHealth = useCallback(async () => {
    if (!endpoint || !enabled) {
      setResult({ status: 'unknown', responseTime: null, lastChecked: null });
      return;
    }

    setResult(prev => ({ ...prev, status: 'checking' }));
    const startTime = performance.now();

    try {
      // Try health endpoint first, fallback to root
      const healthUrl = endpoint.replace(/\/$/, '') + '/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);
      const responseTime = Math.round(performance.now() - startTime);

      setResult({
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: new Date(),
      });
    } catch (error) {
      // CORS errors or network failures - try a HEAD request to root as fallback
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(endpoint, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors',
        });

        clearTimeout(timeoutId);
        const responseTime = Math.round(performance.now() - startTime);

        // no-cors returns opaque response, assume healthy if no error
        setResult({
          status: 'healthy',
          responseTime,
          lastChecked: new Date(),
        });
      } catch {
        setResult({
          status: 'unhealthy',
          responseTime: null,
          lastChecked: new Date(),
        });
      }
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    checkHealth();
    
    // Re-check every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return result;
}
