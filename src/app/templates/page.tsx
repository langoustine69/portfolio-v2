'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Breadcrumbs from '@/components/Breadcrumbs';
import { 
  ArrowDownTrayIcon,
  CodeBracketIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  CommandLineIcon,
  Square3Stack3DIcon,
  CodeBracketSquareIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  framework: string;
  language: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
  setupTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  installCommand: string;
  repoUrl: string;
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'nextjs-starter',
    name: 'Next.js x402 Starter',
    framework: 'Next.js 14',
    language: 'TypeScript',
    description: 'Full-stack template with App Router, server actions, and seamless x402 payment integration.',
    features: [
      'App Router with Server Components',
      'Built-in x402 payment flow',
      'Tailwind CSS styling',
      'Type-safe API routes',
      'Environment variable setup',
      'Error handling & retry logic'
    ],
    icon: '⚡',
    color: 'from-black to-gray-800',
    setupTime: '2 min',
    difficulty: 'beginner',
    installCommand: 'npx create-x402-app@latest my-app --template nextjs',
    repoUrl: 'https://github.com/langoustine69/x402-nextjs-starter',
    tags: ['React', 'SSR', 'Full-stack']
  },
  {
    id: 'express-starter',
    name: 'Express.js API Template',
    framework: 'Express 5',
    language: 'TypeScript',
    description: 'Lightweight Node.js backend with x402 middleware for building agent-powered APIs.',
    features: [
      'Express 5 with async support',
      'x402 middleware included',
      'Request validation with Zod',
      'Rate limiting built-in',
      'Structured logging',
      'Docker-ready setup'
    ],
    icon: '🚂',
    color: 'from-green-600 to-green-800',
    setupTime: '1 min',
    difficulty: 'beginner',
    installCommand: 'npx create-x402-app@latest my-api --template express',
    repoUrl: 'https://github.com/langoustine69/x402-express-starter',
    tags: ['Node.js', 'REST', 'Backend']
  },
  {
    id: 'fastapi-starter',
    name: 'FastAPI Python Template',
    framework: 'FastAPI',
    language: 'Python',
    description: 'High-performance Python backend with async x402 client and Pydantic models.',
    features: [
      'Async/await throughout',
      'Pydantic v2 validation',
      'x402 async client',
      'OpenAPI docs auto-generated',
      'Poetry dependency management',
      'pytest test suite included'
    ],
    icon: '🐍',
    color: 'from-yellow-500 to-green-600',
    setupTime: '3 min',
    difficulty: 'intermediate',
    installCommand: 'pip install cookiecutter && cookiecutter gh:langoustine69/x402-fastapi-starter',
    repoUrl: 'https://github.com/langoustine69/x402-fastapi-starter',
    tags: ['Python', 'Async', 'OpenAPI']
  },
  {
    id: 'go-starter',
    name: 'Go Fiber Template',
    framework: 'Fiber v2',
    language: 'Go',
    description: 'Blazing-fast Go backend with x402 SDK integration and clean architecture.',
    features: [
      'Fiber v2 web framework',
      'Native x402 Go SDK',
      'Clean architecture pattern',
      'Structured error handling',
      'Configuration via Viper',
      'Make-based build system'
    ],
    icon: '🦫',
    color: 'from-cyan-500 to-blue-600',
    setupTime: '2 min',
    difficulty: 'intermediate',
    installCommand: 'go install github.com/langoustine69/x402-go-starter@latest',
    repoUrl: 'https://github.com/langoustine69/x402-go-starter',
    tags: ['Go', 'Performance', 'Compiled']
  },
  {
    id: 'rust-starter',
    name: 'Rust Axum Template',
    framework: 'Axum',
    language: 'Rust',
    description: 'Zero-cost abstractions with type-safe x402 integration for production workloads.',
    features: [
      'Axum web framework',
      'Tower middleware stack',
      'Type-safe x402 client',
      'Tokio async runtime',
      'Comprehensive error types',
      'cargo-watch dev mode'
    ],
    icon: '🦀',
    color: 'from-orange-600 to-red-700',
    setupTime: '5 min',
    difficulty: 'advanced',
    installCommand: 'cargo install cargo-generate && cargo generate langoustine69/x402-rust-starter',
    repoUrl: 'https://github.com/langoustine69/x402-rust-starter',
    tags: ['Rust', 'Performance', 'Type-safe']
  },
  {
    id: 'cloudflare-worker',
    name: 'Cloudflare Worker Template',
    framework: 'Cloudflare Workers',
    language: 'TypeScript',
    description: 'Edge-deployed serverless function with x402 integration for global low-latency.',
    features: [
      'Wrangler CLI setup',
      'KV for caching responses',
      'Durable Objects ready',
      'x402 edge-optimized client',
      'Automatic region routing',
      'Zero cold starts'
    ],
    icon: '☁️',
    color: 'from-orange-400 to-orange-600',
    setupTime: '2 min',
    difficulty: 'intermediate',
    installCommand: 'npm create cloudflare@latest my-worker -- --template langoustine69/x402-worker',
    repoUrl: 'https://github.com/langoustine69/x402-cloudflare-worker',
    tags: ['Serverless', 'Edge', 'Global']
  },
  {
    id: 'discord-bot',
    name: 'Discord Bot Template',
    framework: 'Discord.js',
    language: 'TypeScript',
    description: 'Discord bot with slash commands that call x402 agents for AI-powered responses.',
    features: [
      'Discord.js v14',
      'Slash command registration',
      'Per-user x402 budgets',
      'Rate limiting per guild',
      'Embed response formatting',
      'PM2 production ready'
    ],
    icon: '🤖',
    color: 'from-indigo-500 to-purple-600',
    setupTime: '5 min',
    difficulty: 'intermediate',
    installCommand: 'npx create-x402-app@latest my-bot --template discord',
    repoUrl: 'https://github.com/langoustine69/x402-discord-bot',
    tags: ['Discord', 'Bot', 'Chat']
  },
  {
    id: 'telegram-bot',
    name: 'Telegram Bot Template',
    framework: 'grammY',
    language: 'TypeScript',
    description: 'Telegram bot with conversation handling and x402 agent integration.',
    features: [
      'grammY framework',
      'Session middleware',
      'Conversation plugin',
      'x402 payment tracking',
      'Inline query support',
      'Webhook & polling modes'
    ],
    icon: '📱',
    color: 'from-blue-400 to-blue-600',
    setupTime: '3 min',
    difficulty: 'beginner',
    installCommand: 'npx create-x402-app@latest my-bot --template telegram',
    repoUrl: 'https://github.com/langoustine69/x402-telegram-bot',
    tags: ['Telegram', 'Bot', 'Chat']
  }
];

const difficultyColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
};

function TemplateCard({ template }: { template: Template }) {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(template.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-shell-800/50 dark:bg-gray-800/50 border-4 border-black dark:border-white rounded-none overflow-hidden hover:border-lobster-500 transition-all"
      style={{ boxShadow: '4px 4px 0px 0px #000' }}
    >
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${template.color}`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{template.icon}</span>
            <div>
              <h3 className="text-lg font-black uppercase text-black dark:text-white">{template.name}</h3>
              <p className="text-sm text-shell-600 dark:text-gray-400">{template.framework} • {template.language}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-none border-2 font-bold uppercase ${difficultyColors[template.difficulty]}`}>
            {template.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-shell-700 dark:text-gray-300 text-sm mb-4">{template.description}</p>

        {/* Features */}
        <div className="mb-4">
          <h4 className="text-xs uppercase tracking-wider text-shell-500 dark:text-gray-500 mb-2 font-bold">Includes</h4>
          <ul className="grid grid-cols-2 gap-1">
            {template.features.slice(0, 4).map((feature, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-shell-600 dark:text-gray-400">
                <CheckIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="truncate">{feature}</span>
              </li>
            ))}
          </ul>
          {template.features.length > 4 && (
            <p className="text-xs text-shell-500 dark:text-gray-500 mt-1">+{template.features.length - 4} more</p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-shell-200 dark:bg-gray-700/50 text-shell-600 dark:text-gray-400 border-2 border-black dark:border-gray-600 font-bold">
              {tag}
            </span>
          ))}
        </div>

        {/* Install Command */}
        <div className="bg-black dark:bg-gray-900/50 border-2 border-black dark:border-gray-700 p-3 mb-4">
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs text-lobster-400 font-mono truncate flex-1">
              {template.installCommand}
            </code>
            <button
              onClick={copyCommand}
              className="p-1.5 hover:bg-shell-800 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              title="Copy command"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-400" />
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-shell-500 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {template.setupTime} setup
            </span>
          </div>
          <a
            href={template.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-lobster-500 hover:text-lobster-400 transition-colors font-bold"
          >
            <CodeBracketSquareIcon className="w-4 h-4" />
            View Source
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function TemplatesPage() {
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [langFilter, setLangFilter] = useState<string>('all');

  const languages = [...new Set(templates.map(t => t.language))];
  
  const filteredTemplates = templates.filter(t => {
    if (filter !== 'all' && t.difficulty !== filter) return false;
    if (langFilter !== 'all' && t.language !== langFilter) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-brutal-yellow dark:bg-gray-900 text-black dark:text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Templates', href: '/templates' }
          ]} 
        />

        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-500/10 border-4 border-lobster-500 text-lobster-600 dark:text-lobster-400 text-sm mb-6 font-bold uppercase"
            style={{ boxShadow: '4px 4px 0px 0px #e11d48' }}
          >
            <Square3Stack3DIcon className="w-4 h-4" />
            Production-Ready Starters
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase mb-4"
          >
            Starter Templates
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-shell-600 dark:text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Get up and running in minutes with pre-configured templates for your favorite framework. 
            All templates include x402 payment flow out of the box.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-8 text-sm"
          >
            <div className="flex items-center gap-2">
              <CodeBracketIcon className="w-5 h-5 text-lobster-500" />
              <span className="text-shell-700 dark:text-gray-300 font-bold">{templates.length} Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-shell-700 dark:text-gray-300 font-bold">One-command setup</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-500" />
              <span className="text-shell-700 dark:text-gray-300 font-bold">x402 included</span>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-shell-600 dark:text-gray-400 font-bold uppercase">Difficulty:</span>
            <div className="flex gap-1">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-3 py-1.5 text-sm font-bold uppercase border-2 transition-colors ${
                    filter === level
                      ? 'bg-lobster-500 text-white border-black dark:border-white'
                      : 'bg-shell-200 dark:bg-gray-800 text-shell-600 dark:text-gray-400 border-black dark:border-gray-600 hover:bg-shell-300 dark:hover:bg-gray-700'
                  }`}
                  style={filter === level ? { boxShadow: '2px 2px 0px 0px #000' } : {}}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-shell-600 dark:text-gray-400 font-bold uppercase">Language:</span>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-shell-200 dark:bg-gray-800 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-bold"
            >
              <option value="all">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Start Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-lobster-500/10 to-lobster-600/10 border-4 border-lobster-500 p-6 mb-8"
          style={{ boxShadow: '4px 4px 0px 0px #e11d48' }}
        >
          <div className="flex items-start gap-4">
            <CommandLineIcon className="w-8 h-8 text-lobster-500 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-black uppercase text-black dark:text-white mb-2">Quick Start</h2>
              <p className="text-shell-600 dark:text-gray-400 text-sm mb-3">
                Create a new project with any template using our CLI:
              </p>
              <div className="bg-black border-2 border-black dark:border-gray-700 p-3 font-mono text-sm">
                <span className="text-gray-500">$</span>{' '}
                <span className="text-lobster-400">npx create-x402-app@latest</span>{' '}
                <span className="text-gray-300">my-project</span>
              </div>
              <p className="text-xs text-shell-500 dark:text-gray-500 mt-2">
                The CLI will guide you through template selection and configuration.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TemplateCard template={template} />
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-shell-600 dark:text-gray-400">No templates match your filters.</p>
            <button
              onClick={() => { setFilter('all'); setLangFilter('all'); }}
              className="text-lobster-500 hover:text-lobster-400 mt-2 font-bold"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 py-12 border-t-4 border-black dark:border-gray-800"
        >
          <h2 className="text-2xl font-black uppercase mb-4">Need a Custom Template?</h2>
          <p className="text-shell-600 dark:text-gray-400 mb-6">
            We can create a custom starter template for your specific stack and requirements.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lobster-500 hover:bg-lobster-600 text-white font-black uppercase border-4 border-black transition-colors"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            Get in Touch
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </main>
  );
}
