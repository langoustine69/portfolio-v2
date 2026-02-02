'use client';

import { useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function KeyboardShortcuts() {
  const { showModal, closeModal, shortcuts, pendingKey } = useKeyboardShortcuts();
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and click outside handling
  useEffect(() => {
    if (showModal) {
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // Group shortcuts by category
  const navigationShortcuts = shortcuts.filter(s => s.category === 'navigation');
  const actionShortcuts = shortcuts.filter(s => s.category === 'actions');
  const generalShortcuts = shortcuts.filter(s => s.category === 'general');

  const formatKey = (key: string) => {
    return key.split(' ').map((k, i) => (
      <span key={i} className="inline-flex items-center">
        <kbd className="px-2 py-1 text-sm font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 text-shell-200 dark:text-shell-200 light:text-shell-700 rounded border border-shell-600 dark:border-shell-600 light:border-shell-300 shadow-sm">
          {k === 'Escape' ? 'Esc' : k}
        </kbd>
        {i < key.split(' ').length - 1 && (
          <span className="mx-1 text-shell-500 text-xs">then</span>
        )}
      </span>
    ));
  };

  if (!showModal) {
    // Show pending key indicator
    if (pendingKey) {
      return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="bg-shell-800 dark:bg-shell-800 light:bg-shell-100 border border-shell-600 dark:border-shell-600 light:border-shell-300 rounded-lg px-4 py-2 shadow-lg">
            <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 text-sm">
              Press key: 
            </span>
            <kbd className="ml-2 px-2 py-1 text-sm font-mono bg-lobster-600 text-white rounded">
              {pendingKey}
            </kbd>
            <span className="mx-1 text-shell-500">+</span>
            <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 text-sm">
              h/a/c/p/b/g
            </span>
          </div>
        </div>
      );
    }
    
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeModal}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-shell-900 dark:bg-shell-900 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-shell-700 dark:border-shell-700 light:border-shell-200">
          <h2 id="shortcuts-title" className="text-xl font-semibold text-white dark:text-white light:text-shell-900 flex items-center gap-2">
            <span className="text-2xl">⌨️</span>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={closeModal}
            className="p-1 text-shell-400 hover:text-white dark:hover:text-white light:hover:text-shell-900 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {/* Navigation */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-lobster-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between py-1">
                  <span className="text-shell-300 dark:text-shell-300 light:text-shell-600">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center">
                    {formatKey(shortcut.key)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-lobster-400 uppercase tracking-wider mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              {actionShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between py-1">
                  <span className="text-shell-300 dark:text-shell-300 light:text-shell-600">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center">
                    {formatKey(shortcut.key)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* General */}
          <div>
            <h3 className="text-sm font-medium text-lobster-400 uppercase tracking-wider mb-3">
              General
            </h3>
            <div className="space-y-2">
              {generalShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between py-1">
                  <span className="text-shell-300 dark:text-shell-300 light:text-shell-600">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center">
                    {formatKey(shortcut.key)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-shell-700 dark:border-shell-700 light:border-shell-200 bg-shell-800/50 dark:bg-shell-800/50 light:bg-shell-50">
          <p className="text-xs text-shell-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 rounded">?</kbd> anytime to show this menu
          </p>
        </div>
      </div>
    </div>
  );
}

// Small indicator button that can be added to the footer
export function KeyboardShortcutsHint() {
  return (
    <button
      onClick={() => {
        // Dispatch a custom event that the hook can listen to, or just simulate '?' keypress
        const event = new KeyboardEvent('keydown', { key: '?', bubbles: true });
        document.dispatchEvent(event);
      }}
      className="inline-flex items-center gap-1.5 text-shell-500 hover:text-shell-300 transition-colors text-sm"
      title="Keyboard shortcuts"
    >
      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-shell-800 dark:bg-shell-800 light:bg-shell-200 rounded border border-shell-700 dark:border-shell-700 light:border-shell-300">
        ?
      </kbd>
      <span>Shortcuts</span>
    </button>
  );
}
