'use client';

import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  agentId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function FavoriteButton({ 
  agentId, 
  size = 'md', 
  showLabel = false,
  className = '' 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, mounted } = useFavorites();
  
  const favorited = isFavorite(agentId);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`${buttonSizes[size]} rounded-full transition-all ${className}`}
        disabled
        aria-label="Loading favorites"
      >
        <svg
          className={`${sizeClasses[size]} text-shell-600`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(agentId);
      }}
      className={`
        ${buttonSizes[size]} rounded-full transition-all duration-200 ease-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-lobster-400/50
        ${favorited 
          ? 'text-lobster-400 hover:text-lobster-300' 
          : 'text-shell-500 hover:text-lobster-400'
        }
        ${className}
      `}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`${sizeClasses[size]} transition-all duration-200`}
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span className="ml-1.5 text-sm">
          {favorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
