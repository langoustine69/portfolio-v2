'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isOnline, isUpdateAvailable, promptInstall, updateApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // Check localStorage for dismissal
  useEffect(() => {
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        setDismissed(true);
      }
    }
  }, []);

  // Show update banner when available
  useEffect(() => {
    if (isUpdateAvailable) {
      setShowUpdateBanner(true);
    }
  }, [isUpdateAvailable]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      handleDismiss();
    }
  };

  // Update banner
  if (showUpdateBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
        <div className="bg-blue-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Update Available</p>
            <p className="text-sm text-blue-100">A new version is ready to install.</p>
          </div>
          <button
            onClick={updateApp}
            className="flex-shrink-0 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-lobster-600 to-lobster-500 text-white rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-4xl">🦞</div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Install Langoustine69</p>
            <p className="text-sm text-white/90 mt-1">
              Add to your home screen for quick access to x402 agents.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-lobster-600 px-4 py-2 rounded-lg font-semibold hover:bg-lobster-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Delay hiding to show "back online" briefly
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-center py-2 text-sm font-medium transition-colors ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-yellow-500 text-yellow-900'
    }`}>
      {isOnline ? (
        <span>✓ Back online</span>
      ) : (
        <span>⚡ You&apos;re offline — some features may be limited</span>
      )}
    </div>
  );
}

// Install button for header/footer
export function InstallButton({ className = '' }: { className?: string }) {
  const { isInstallable, isInstalled, promptInstall } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={promptInstall}
      className={`inline-flex items-center gap-2 text-sm ${className}`}
      title="Install app"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Install
    </button>
  );
}
