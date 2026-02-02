'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

interface ShortcutAction {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'general';
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const pendingKeyTimeout = useRef<NodeJS.Timeout | null>(null);

  const closeModal = useCallback(() => setShowModal(false), []);
  const openModal = useCallback(() => setShowModal(true), []);

  // Define all shortcuts
  const shortcuts: ShortcutAction[] = [
    // Navigation (g + key)
    { key: 'g h', description: 'Go to Home', action: () => router.push('/'), category: 'navigation' },
    { key: 'g a', description: 'Go to Agents', action: () => router.push('/agents'), category: 'navigation' },
    { key: 'g c', description: 'Go to Compare', action: () => router.push('/compare'), category: 'navigation' },
    { key: 'g p', description: 'Go to Playground', action: () => router.push('/#playground'), category: 'navigation' },
    { key: 'g b', description: 'Go to Blog', action: () => router.push('/blog'), category: 'navigation' },
    { key: 'g g', description: 'Go to Guides', action: () => router.push('/guides'), category: 'navigation' },
    
    // Actions
    { key: '/', description: 'Focus search', action: () => focusSearch(), category: 'actions' },
    { key: 't', description: 'Toggle theme', action: toggleTheme, category: 'actions' },
    
    // General
    { key: '?', description: 'Show keyboard shortcuts', action: openModal, category: 'general' },
    { key: 'Escape', description: 'Close modal / Unfocus', action: closeModal, category: 'general' },
  ];

  const focusSearch = () => {
    // Try to find search input on the page
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[placeholder*="Search"], input[type="search"], input[name="search"], #search-input'
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only handle Escape in inputs
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Handle Escape
      if (e.key === 'Escape') {
        setShowModal(false);
        return;
      }

      // Handle ? for help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowModal(true);
        return;
      }

      // Handle / for search
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        focusSearch();
        return;
      }

      // Handle t for theme toggle
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !pendingKey) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // Handle g + key navigation shortcuts
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !pendingKey) {
        e.preventDefault();
        setPendingKey('g');
        
        // Clear pending key after 1.5 seconds
        if (pendingKeyTimeout.current) {
          clearTimeout(pendingKeyTimeout.current);
        }
        pendingKeyTimeout.current = setTimeout(() => {
          setPendingKey(null);
        }, 1500);
        return;
      }

      // Handle second key after 'g'
      if (pendingKey === 'g') {
        e.preventDefault();
        setPendingKey(null);
        
        if (pendingKeyTimeout.current) {
          clearTimeout(pendingKeyTimeout.current);
        }

        switch (e.key) {
          case 'h':
            router.push('/');
            break;
          case 'a':
            router.push('/agents');
            break;
          case 'c':
            router.push('/compare');
            break;
          case 'p':
            router.push('/#playground');
            break;
          case 'b':
            router.push('/blog');
            break;
          case 'g':
            router.push('/guides');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (pendingKeyTimeout.current) {
        clearTimeout(pendingKeyTimeout.current);
      }
    };
  }, [pendingKey, router, toggleTheme]);

  return {
    showModal,
    closeModal,
    openModal,
    shortcuts,
    pendingKey,
  };
}
