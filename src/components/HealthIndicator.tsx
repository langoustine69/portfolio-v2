'use client';

import { useHealthStatus, HealthStatus } from '@/hooks/useHealthStatus';

interface HealthIndicatorProps {
  endpoint: string | undefined;
  staticStatus: 'live' | 'offline' | 'building';
  showResponseTime?: boolean;
}

const statusConfig: Record<HealthStatus, { color: string; label: string; pulse: boolean }> = {
  checking: { color: 'bg-yellow-500', label: 'Checking...', pulse: true },
  healthy: { color: 'bg-emerald-500', label: 'Healthy', pulse: true },
  unhealthy: { color: 'bg-red-500', label: 'Down', pulse: false },
  unknown: { color: 'bg-shell-500', label: 'Unknown', pulse: false },
};

const staticStatusConfig = {
  live: { color: 'bg-lobster-500', label: 'Live', pulse: true },
  building: { color: 'bg-yellow-500', label: 'Building', pulse: false },
  offline: { color: 'bg-shell-500', label: 'Offline', pulse: false },
};

export default function HealthIndicator({ 
  endpoint, 
  staticStatus,
  showResponseTime = false 
}: HealthIndicatorProps) {
  // Only ping if the agent is marked as live and has an endpoint
  const shouldPing = staticStatus === 'live' && !!endpoint;
  const { status, responseTime } = useHealthStatus(endpoint, shouldPing);

  // For non-live agents, show static status
  if (!shouldPing) {
    const config = staticStatusConfig[staticStatus];
    return (
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-xs text-shell-400 dark:text-shell-400 light:text-shell-500">
          {config.label}
        </span>
      </div>
    );
  }

  // For live agents, show real health status
  const config = statusConfig[status];
  
  return (
    <div className="flex items-center gap-1.5" title={responseTime ? `Response: ${responseTime}ms` : undefined}>
      <span 
        className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} 
      />
      <span className="text-xs text-shell-400 dark:text-shell-400 light:text-shell-500">
        {config.label}
      </span>
      {showResponseTime && responseTime !== null && status === 'healthy' && (
        <span className="text-xs text-shell-500 dark:text-shell-500 light:text-shell-400">
          ({responseTime}ms)
        </span>
      )}
    </div>
  );
}
