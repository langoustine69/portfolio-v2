'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface A11yContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  reduceMotion: boolean;
}

const A11yContext = createContext<A11yContextValue | null>(null);

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return ctx;
}

/**
 * A11yProvider - Accessibility context provider
 * 
 * Provides:
 * - Live region announcements for screen readers
 * - Reduced motion preference detection
 * - Global accessibility utilities
 */
export default function A11yProvider({ children }: { children: ReactNode }) {
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear then set to ensure screen readers pick up the change
    if (priority === 'assertive') {
      setAssertiveAnnouncement('');
      setTimeout(() => setAssertiveAnnouncement(message), 50);
    } else {
      setPoliteAnnouncement('');
      setTimeout(() => setPoliteAnnouncement(message), 50);
    }
  }, []);

  return (
    <A11yContext.Provider value={{ announce, reduceMotion }}>
      {children}
      
      {/* Live regions for screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncement}
      </div>
      
      <div 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveAnnouncement}
      </div>
    </A11yContext.Provider>
  );
}

/**
 * Hook-free version for components that might render outside provider
 */
export function A11yAnnouncer({ message, priority = 'polite' }: { message: string; priority?: 'polite' | 'assertive' }) {
  if (!message) return null;
  
  return priority === 'assertive' ? (
    <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
      {message}
    </div>
  ) : (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

/**
 * Visually hidden but accessible text
 */
export function VisuallyHidden({ children, as: Component = 'span' }: { children: ReactNode; as?: 'span' | 'div' | 'p' }) {
  return <Component className="sr-only">{children}</Component>;
}

/**
 * Focus trap hook for modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive, container]);

  return setContainer;
}
