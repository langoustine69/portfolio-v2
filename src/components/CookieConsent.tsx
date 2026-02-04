'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ConsentLevel = 'essential' | 'analytics' | 'all';

interface CookiePreferences {
  essential: boolean; // Always true, required
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CONSENT_KEY = 'langoustine69_cookie_consent';
const CONSENT_VERSION = '1.0';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: 0,
  });

  useEffect(() => {
    // Check if user has already given consent
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if consent is still valid (re-ask after 1 year)
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp < oneYear) {
          setPreferences(parsed);
          return; // Don't show banner
        }
      } catch {
        // Invalid stored data, show banner
      }
    }
    // Delay showing banner slightly for better UX
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const toSave = { ...prefs, timestamp: Date.now(), version: CONSENT_VERSION };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(toSave));
    setPreferences(toSave);
    setIsVisible(false);
    
    // Apply consent choices (in a real app, this would configure analytics, etc.)
    if (prefs.analytics) {
      console.log('Analytics enabled');
    }
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
        onClick={() => setShowDetails(false)}
      />
      
      {/* Banner */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[999] transition-transform duration-500 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-shell-950 border-t border-shell-800 shadow-2xl shadow-black/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {!showDetails ? (
              // Simple view
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-0.5">🍪</span>
                  <div>
                    <p className="text-white text-sm sm:text-base">
                      We use cookies to enhance your browsing experience and analyze site traffic.
                    </p>
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-lobster-400 text-sm hover:underline mt-1"
                    >
                      Manage preferences
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={acceptEssential}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-shell-300 border border-shell-700 rounded-lg hover:bg-shell-800 transition-colors"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-lobster-600 text-white rounded-lg hover:bg-lobster-500 transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              // Detailed view
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🍪</span> Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-shell-400 hover:text-white p-1"
                    aria-label="Close details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-shell-400 text-sm">
                  Choose which cookies you want to allow. Your choices will be saved for one year.{' '}
                  <Link href="/privacy" className="text-lobster-400 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
                
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Essential */}
                  <div className="bg-shell-900 border border-shell-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Essential</span>
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                        Required
                      </span>
                    </div>
                    <p className="text-shell-400 text-xs">
                      Required for site functionality. Cannot be disabled.
                    </p>
                  </div>
                  
                  {/* Analytics */}
                  <div className="bg-shell-900 border border-shell-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Analytics</span>
                      <button
                        onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          preferences.analytics ? 'bg-lobster-600' : 'bg-shell-700'
                        }`}
                        role="switch"
                        aria-checked={preferences.analytics}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            preferences.analytics ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-shell-400 text-xs">
                      Helps us understand how visitors interact with the site.
                    </p>
                  </div>
                  
                  {/* Marketing */}
                  <div className="bg-shell-900 border border-shell-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Marketing</span>
                      <button
                        onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          preferences.marketing ? 'bg-lobster-600' : 'bg-shell-700'
                        }`}
                        role="switch"
                        aria-checked={preferences.marketing}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            preferences.marketing ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-shell-400 text-xs">
                      Used for targeted advertising and social features.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={acceptEssential}
                    className="px-4 py-2 text-sm font-medium text-shell-300 hover:text-white transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={saveCustom}
                    className="px-4 py-2 text-sm font-medium bg-lobster-600 text-white rounded-lg hover:bg-lobster-500 transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to check/update consent from other components
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  };

  return { consent, resetConsent };
}
