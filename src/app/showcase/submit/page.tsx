'use client';

import { useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { categoryMeta } from '@/data/showcase';
import { agents } from '@/data/agents';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function SubmitShowcasePage() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    category: '',
    url: '',
    github: '',
    agents: [] as string[],
    authorName: '',
    authorHandle: '',
    email: '',
  });

  const handleAgentToggle = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      agents: prev.agents.includes(agentId)
        ? prev.agents.filter(a => a !== agentId)
        : [...prev.agents, agentId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Simulate submission (in real app, this would POST to an API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <main className="min-h-screen">
        <Breadcrumbs />
        <div className="py-20 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center text-5xl">
              ✅
            </div>
            <h1 className="text-3xl font-bold text-shell-100 mb-4">
              Submission Received!
            </h1>
            <p className="text-shell-400 mb-8">
              Thanks for submitting your project! We&apos;ll review it and add it to the showcase soon. 
              You&apos;ll receive an email when it goes live.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/showcase"
                className="px-6 py-3 bg-shell-800 hover:bg-shell-700 border border-shell-700 text-shell-200 rounded-xl transition-all"
              >
                Back to Showcase
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-lobster-600 hover:bg-lobster-500 text-white rounded-xl transition-all"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Breadcrumbs />

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-shell-100 mb-4">
              Submit Your Project 🚀
            </h1>
            <p className="text-shell-400">
              Built something with our x402 agents? Share it with the community!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-shell-200 font-medium mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                className="w-full px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
                placeholder="e.g., FantasyFooty Pro"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-shell-200 font-medium mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50 resize-none"
                placeholder="Tell us about your project and how it uses our agents..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-shell-200 font-medium mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(categoryMeta).map(([key, { icon, label }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: key }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.category === key
                        ? 'bg-lobster-600/20 border-lobster-500 text-shell-100'
                        : 'bg-shell-800 border-shell-700 text-shell-400 hover:border-shell-600'
                    }`}
                  >
                    <span className="text-xl mr-2">{icon}</span>
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Agents Used */}
            <div>
              <label className="block text-shell-200 font-medium mb-2">
                Which agents do you use? *
              </label>
              <div className="flex flex-wrap gap-2">
                {agents.filter(a => a.status === 'live').map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => handleAgentToggle(agent.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formData.agents.includes(agent.id)
                        ? 'bg-lobster-600 text-white'
                        : 'bg-shell-800 border border-shell-700 text-shell-400 hover:border-shell-600'
                    }`}
                  >
                    {agent.name}
                  </button>
                ))}
              </div>
            </div>

            {/* URLs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-shell-200 font-medium mb-2">
                  Project URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-shell-200 font-medium mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                  className="w-full px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Author Info */}
            <div className="pt-4 border-t border-shell-700">
              <h3 className="text-shell-200 font-medium mb-4">About You</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-shell-400 text-sm mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                    className="w-full px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-shell-400 text-sm mb-2">
                    X / Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={formData.authorHandle}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorHandle: e.target.value }))}
                    className="w-full px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
                    placeholder="@yourhandle"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-shell-400 text-sm mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
                  placeholder="you@example.com"
                />
                <p className="text-shell-500 text-xs mt-1">
                  We&apos;ll only use this to notify you when your project is live.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'submitting' || !formData.projectName || !formData.description || !formData.category || formData.agents.length === 0}
              className="w-full py-4 bg-gradient-to-r from-lobster-600 to-lobster-500 hover:from-lobster-500 hover:to-lobster-400 disabled:from-shell-700 disabled:to-shell-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg shadow-lobster-600/20"
            >
              {status === 'submitting' ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Submitting...
                </span>
              ) : (
                'Submit Project'
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
