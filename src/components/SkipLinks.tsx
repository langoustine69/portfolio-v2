'use client';

/**
 * SkipLinks - Accessibility component for keyboard navigation
 * 
 * Allows keyboard users to bypass navigation and jump directly to content.
 * Links are visually hidden until focused, then appear prominently.
 */
export default function SkipLinks() {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#agents-grid', label: 'Skip to agents' },
    { href: '#footer', label: 'Skip to footer' },
  ];

  return (
    <nav 
      className="fixed top-0 left-0 z-[200] p-2"
      aria-label="Skip links"
    >
      <ul className="flex flex-col gap-2">
        {skipLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="
                absolute -translate-y-full opacity-0 pointer-events-none
                focus:static focus:translate-y-0 focus:opacity-100 focus:pointer-events-auto
                inline-flex items-center gap-2 px-4 py-3 
                text-sm font-semibold text-white 
                bg-lobster-600 hover:bg-lobster-500 
                rounded-lg shadow-lg
                focus:outline-none focus:ring-2 focus:ring-lobster-400 focus:ring-offset-2 
                focus:ring-offset-shell-950 dark:focus:ring-offset-shell-950 light:focus:ring-offset-white 
                transition-all duration-150
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Accessible loading indicator with ARIA
 */
export function A11yLoadingSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2">
      <svg 
        className="animate-spin h-5 w-5 text-lobster-400" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Focus visible indicator component
 * Use to wrap elements that need enhanced focus indication
 */
export function FocusRing({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`focus-within:ring-2 focus-within:ring-lobster-400 focus-within:ring-offset-2 rounded-lg ${className}`}>
      {children}
    </div>
  );
}
