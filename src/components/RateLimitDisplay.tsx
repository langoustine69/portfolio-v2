'use client';

export interface RateLimitInfo {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  burstLimit?: number;
  note?: string;
}

interface RateLimitDisplayProps {
  rateLimit?: RateLimitInfo;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export default function RateLimitDisplay({ 
  rateLimit, 
  variant = 'compact',
  className = '' 
}: RateLimitDisplayProps) {
  // Default rate limits for x402 agents
  const limits = rateLimit || {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    burstLimit: 10,
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 text-xs ${className}`}>
        <svg 
          className="w-3.5 h-3.5 text-shell-500 dark:text-shell-500 light:text-shell-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">
          {limits.requestsPerMinute}/min
        </span>
        {limits.burstLimit && (
          <span className="text-shell-500 dark:text-shell-500 light:text-shell-400">
            · {limits.burstLimit} burst
          </span>
        )}
      </div>
    );
  }

  // Detailed variant for agent detail pages
  return (
    <div className={`bg-[#1a1a1a] border border-[#333] rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <svg 
          className="w-5 h-5 text-[#ff6b9d]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
        <h3 className="text-sm font-medium text-[#666] uppercase tracking-wider">
          Rate Limits
        </h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {limits.requestsPerMinute && (
          <div className="text-center p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <div className="text-2xl font-bold text-white">{limits.requestsPerMinute}</div>
            <div className="text-xs text-[#666] mt-1">per minute</div>
          </div>
        )}
        
        {limits.requestsPerHour && (
          <div className="text-center p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <div className="text-2xl font-bold text-white">
              {limits.requestsPerHour >= 1000 
                ? `${(limits.requestsPerHour / 1000).toFixed(limits.requestsPerHour % 1000 === 0 ? 0 : 1)}k` 
                : limits.requestsPerHour}
            </div>
            <div className="text-xs text-[#666] mt-1">per hour</div>
          </div>
        )}
        
        {limits.requestsPerDay && (
          <div className="text-center p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <div className="text-2xl font-bold text-white">
              {limits.requestsPerDay >= 1000 
                ? `${(limits.requestsPerDay / 1000).toFixed(limits.requestsPerDay % 1000 === 0 ? 0 : 1)}k` 
                : limits.requestsPerDay}
            </div>
            <div className="text-xs text-[#666] mt-1">per day</div>
          </div>
        )}
        
        {limits.burstLimit && (
          <div className="text-center p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <div className="text-2xl font-bold text-[#ff6b9d]">{limits.burstLimit}</div>
            <div className="text-xs text-[#666] mt-1">burst limit</div>
          </div>
        )}
      </div>
      
      {limits.note && (
        <p className="text-xs text-[#666] mt-3 italic">{limits.note}</p>
      )}
      
      <div className="mt-4 pt-3 border-t border-[#222]">
        <div className="flex items-start gap-2">
          <svg 
            className="w-4 h-4 text-[#666] mt-0.5 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="text-xs text-[#666]">
            Rate limits are per IP address. x402 payments bypass rate limits for priority access.
            Check <code className="text-[#888] bg-[#1a1a1a] px-1 rounded">X-RateLimit-*</code> headers in responses.
          </p>
        </div>
      </div>
    </div>
  );
}
