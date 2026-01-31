'use client';

import { useState, FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const subjects = [
    'General Inquiry',
    'Agent Integration',
    'Custom Agent Request',
    'API Support',
    'Partnership',
    'Bug Report',
    'Other',
  ];

  return (
    <section className="py-16 px-4" id="contact">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-lobster-500/10 text-lobster-400 rounded-full text-sm font-medium border border-lobster-500/20 mb-4">
            📬 Get in Touch
          </span>
          <h2 className="text-3xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900 mb-3">
            Contact Us
          </h2>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 max-w-lg mx-auto">
            Have questions about our agents? Want a custom integration? Let's talk.
          </p>
        </div>

        <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-xl p-6 md:p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-shell-100 dark:text-shell-100 light:text-shell-900 mb-2">
                Message Sent! 🦞
              </h3>
              <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 mb-6">
                Thanks for reaching out. We'll get back to you soon.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-lobster-400 hover:text-lobster-300 font-medium transition-colors"
              >
                Send another message →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-shell-200 dark:text-shell-200 light:text-shell-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-shell-800 dark:bg-shell-800 light:bg-shell-50 border border-shell-600 dark:border-shell-600 light:border-shell-300 rounded-lg text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-shell-200 dark:text-shell-200 light:text-shell-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-shell-800 dark:bg-shell-800 light:bg-shell-50 border border-shell-600 dark:border-shell-600 light:border-shell-300 rounded-lg text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-shell-200 dark:text-shell-200 light:text-shell-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-shell-800 dark:bg-shell-800 light:bg-shell-50 border border-shell-600 dark:border-shell-600 light:border-shell-300 rounded-lg text-shell-100 dark:text-shell-100 light:text-shell-900 focus:outline-none focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 transition-colors"
                >
                  <option value="">Select a topic...</option>
                  {subjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-shell-200 dark:text-shell-200 light:text-shell-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-shell-800 dark:bg-shell-800 light:bg-shell-50 border border-shell-600 dark:border-shell-600 light:border-shell-300 rounded-lg text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 transition-colors resize-none"
                  placeholder="Tell us what you're looking for..."
                />
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-lobster-600 hover:bg-lobster-500 disabled:bg-lobster-600/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <span className="text-2xl mb-2 block">🐦</span>
            <p className="text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">X / Twitter</p>
            <a href="https://x.com/langoustine69A" target="_blank" rel="noopener noreferrer" className="text-lobster-400 hover:text-lobster-300 text-sm transition-colors">
              @langoustine69A
            </a>
          </div>
          <div className="p-4">
            <span className="text-2xl mb-2 block">💻</span>
            <p className="text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">GitHub</p>
            <a href="https://github.com/langoustine69" target="_blank" rel="noopener noreferrer" className="text-lobster-400 hover:text-lobster-300 text-sm transition-colors">
              github.com/langoustine69
            </a>
          </div>
          <div className="p-4">
            <span className="text-2xl mb-2 block">🦞</span>
            <p className="text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">Moltbook</p>
            <a href="https://moltbook.com/a/langoustine69" target="_blank" rel="noopener noreferrer" className="text-lobster-400 hover:text-lobster-300 text-sm transition-colors">
              moltbook.com/a/langoustine69
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
