'use client';

import { useState, FormEvent } from 'react';

type SubscribeStatus = 'idle' | 'submitting' | 'success' | 'error';

interface NewsletterProps {
  variant?: 'inline' | 'card' | 'brutal';
}

export default function Newsletter({ variant = 'inline' }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscribeStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  // Brutal variant
  if (variant === 'brutal') {
    if (status === 'success') {
      return (
        <div className="p-4 bg-brutal-lime border-2 border-black" style={{ boxShadow: '4px 4px 0px 0px #000000' }}>
          <div className="flex items-center gap-2 text-black font-bold uppercase">
            <span className="text-xl">✓</span>
            <span>SUBSCRIBED! 🦞</span>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="text-black/70 hover:text-black text-xs mt-2 font-bold uppercase"
          >
            → ADD ANOTHER
          </button>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-black dark:text-white font-black uppercase mb-2 text-lg">
          NEWSLETTER
        </h3>
        <p className="text-black dark:text-shell-300 font-medium text-sm mb-3">
          New agent launches & updates
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="YOUR@EMAIL.COM"
            className="px-3 py-2 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white placeholder-shell-500 focus:outline-none font-bold uppercase text-sm"
            style={{ boxShadow: '2px 2px 0px 0px #000000' }}
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="px-4 py-2 bg-lobster-500 hover:bg-lobster-600 disabled:bg-shell-400 text-white font-bold uppercase text-sm border-2 border-black transition-colors"
            style={{ boxShadow: '2px 2px 0px 0px #000000' }}
          >
            {status === 'submitting' ? 'SUBSCRIBING...' : 'SUBSCRIBE →'}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-2 font-bold uppercase">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={variant === 'card' ? 'text-center py-4' : ''}>
        <div className="flex items-center gap-2 text-green-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm">You're subscribed! 🦞</span>
        </div>
        <button
          onClick={() => setStatus('idle')}
          className="text-shell-500 hover:text-shell-400 text-xs mt-2 transition-colors"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <span className="text-2xl mb-2 block">📬</span>
          <h3 className="text-lg font-semibold text-shell-100 dark:text-shell-100 light:text-shell-900 mb-1">
            Stay Updated
          </h3>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 text-sm">
            Get notified when we launch new agents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 bg-shell-800 dark:bg-shell-800 light:bg-shell-50 border border-shell-600 dark:border-shell-600 light:border-shell-300 rounded-lg text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 transition-colors text-sm"
          />
          
          {status === 'error' && (
            <p className="text-red-400 text-xs">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-lobster-600 hover:bg-lobster-500 disabled:bg-lobster-600/50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
          >
            {status === 'submitting' ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>

        <p className="text-shell-500 text-xs text-center mt-3">
          No spam, unsubscribe anytime
        </p>
      </div>
    );
  }

  // Inline variant (for footer)
  return (
    <div>
      <h3 className="text-shell-100 dark:text-shell-100 light:text-shell-800 font-semibold mb-3">
        Newsletter
      </h3>
      <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 text-sm mb-3">
        New agent launches & updates
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="flex-1 min-w-0 px-3 py-2 bg-shell-800 dark:bg-shell-800 light:bg-shell-50 border border-shell-700 dark:border-shell-700 light:border-shell-300 rounded-lg text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-4 py-2 bg-lobster-600 hover:bg-lobster-500 disabled:bg-lobster-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm flex-shrink-0"
        >
          {status === 'submitting' ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            '→'
          )}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
