'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRequestTemplates, RequestTemplate } from '@/hooks/useRequestTemplates';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  PencilIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  ShareIcon,
  BookmarkIcon,
  TagIcon,
  ClockIcon,
  ChartBarIcon,
  CodeBracketIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/50',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/50'
};

interface TemplateCardProps {
  template: RequestTemplate;
  isCommunity: boolean;
  onUse: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

function TemplateCard({ template, isCommunity, onUse, onDuplicate, onExport, onDelete, onEdit }: TemplateCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyShareLink = async () => {
    const shareData = btoa(JSON.stringify({
      name: template.name,
      description: template.description,
      agentId: template.agentId,
      agentName: template.agentName,
      endpoint: template.endpoint,
      method: template.method,
      headers: template.headers,
      queryParams: template.queryParams,
      body: template.body,
      category: template.category,
      tags: template.tags
    }));
    const url = `${window.location.origin}/request-templates?import=${shareData}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-shell-100 dark:bg-gray-800/50 border-4 border-black dark:border-gray-700 hover:border-lobster-500 transition-all"
      style={{ boxShadow: '4px 4px 0px 0px #000' }}
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-black dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 font-mono font-bold border ${methodColors[template.method]}`}>
                {template.method}
              </span>
              {isCommunity && (
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/50 font-bold">
                  Community
                </span>
              )}
            </div>
            <h3 className="font-black text-black dark:text-white truncate">{template.name}</h3>
            <p className="text-xs text-shell-600 dark:text-gray-400 mt-1">{template.agentName}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={copyShareLink}
              className="p-1.5 text-shell-500 dark:text-gray-500 hover:text-lobster-500 transition-colors"
              title="Share template"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ShareIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm text-shell-700 dark:text-gray-300 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Endpoint Preview */}
        <div className="bg-black dark:bg-gray-900 border-2 border-black dark:border-gray-600 p-2 mb-3 font-mono text-xs overflow-x-auto">
          <code className="text-lobster-400">
            {template.endpoint}
            {Object.keys(template.queryParams).length > 0 && (
              <span className="text-gray-500">?{Object.entries(template.queryParams).map(([k, v]) => `${k}=${v}`).join('&')}</span>
            )}
          </code>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {template.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-shell-200 dark:bg-gray-700 text-shell-600 dark:text-gray-400 border border-black dark:border-gray-600">
              #{tag}
            </span>
          ))}
          {template.tags.length > 4 && (
            <span className="text-xs text-shell-500 dark:text-gray-500">+{template.tags.length - 4}</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-shell-500 dark:text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <ChartBarIcon className="w-3.5 h-3.5" />
            {template.usageCount.toLocaleString()} uses
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            {new Date(template.updatedAt).toLocaleDateString()}
          </span>
          {template.author && (
            <span className="flex items-center gap-1">
              by {template.author}
            </span>
          )}
        </div>

        {/* Expandable Code Preview */}
        {showCode && template.body && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4"
          >
            <div className="text-xs text-shell-500 dark:text-gray-500 mb-1 font-bold uppercase">Request Body</div>
            <pre className="bg-black dark:bg-gray-900 border-2 border-black dark:border-gray-600 p-2 text-xs overflow-x-auto max-h-32">
              <code className="text-gray-300">{template.body}</code>
            </pre>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api-playground?agent=${template.agentId}&endpoint=${encodeURIComponent(template.endpoint)}&method=${template.method}`}
            onClick={onUse}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-lobster-500 hover:bg-lobster-600 text-white text-sm font-bold border-2 border-black transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            Use in Playground
          </a>
          
          <button
            onClick={onDuplicate}
            className="p-2 bg-shell-200 dark:bg-gray-700 hover:bg-shell-300 dark:hover:bg-gray-600 text-shell-700 dark:text-gray-300 border-2 border-black dark:border-gray-600 transition-colors"
            title="Save to My Templates"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>

          <button
            onClick={onExport}
            className="p-2 bg-shell-200 dark:bg-gray-700 hover:bg-shell-300 dark:hover:bg-gray-600 text-shell-700 dark:text-gray-300 border-2 border-black dark:border-gray-600 transition-colors"
            title="Export JSON"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>

          {template.body && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-2 bg-shell-200 dark:bg-gray-700 hover:bg-shell-300 dark:hover:bg-gray-600 text-shell-700 dark:text-gray-300 border-2 border-black dark:border-gray-600 transition-colors"
              title={showCode ? 'Hide body' : 'Show body'}
            >
              <CodeBracketIcon className="w-4 h-4" />
            </button>
          )}

          {!isCommunity && onEdit && (
            <button
              onClick={onEdit}
              className="p-2 bg-shell-200 dark:bg-gray-700 hover:bg-shell-300 dark:hover:bg-gray-600 text-shell-700 dark:text-gray-300 border-2 border-black dark:border-gray-600 transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}

          {!isCommunity && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-2 border-red-500/50 transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<RequestTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  initialData?: Partial<RequestTemplate>;
}

function CreateTemplateModal({ isOpen, onClose, onSave, initialData }: CreateTemplateModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [agentId, setAgentId] = useState(initialData?.agentId || '');
  const [agentName, setAgentName] = useState(initialData?.agentName || '');
  const [endpoint, setEndpoint] = useState(initialData?.endpoint || '');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>(initialData?.method || 'GET');
  const [headers, setHeaders] = useState(JSON.stringify(initialData?.headers || { 'Accept': 'application/json' }, null, 2));
  const [queryParams, setQueryParams] = useState(JSON.stringify(initialData?.queryParams || {}, null, 2));
  const [body, setBody] = useState(initialData?.body || '');
  const [category, setCategory] = useState(initialData?.category || 'General');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSave({
        name,
        description,
        agentId,
        agentName,
        endpoint,
        method,
        headers: JSON.parse(headers),
        queryParams: JSON.parse(queryParams),
        body: body || undefined,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isPublic: false
      });
      onClose();
    } catch (e) {
      alert('Invalid JSON in headers or query params');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-shell-100 dark:bg-gray-800 border-4 border-black dark:border-gray-600"
        style={{ boxShadow: '8px 8px 0px 0px #000' }}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b-2 border-black dark:border-gray-600 bg-shell-100 dark:bg-gray-800">
          <h2 className="text-xl font-black uppercase text-black dark:text-white">
            {initialData ? 'Edit Template' : 'Create Template'}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-lobster-500">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none"
                placeholder="My API Template"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none"
                placeholder="Finance, AI/ML, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none resize-none"
              placeholder="What does this template do?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Agent ID *</label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none"
                placeholder="weather-agent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none"
                placeholder="Weather Agent"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Method *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Endpoint *</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-mono"
                placeholder="/forecast"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Headers (JSON)</label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-mono text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Query Params (JSON)</label>
            <textarea
              value={queryParams}
              onChange={(e) => setQueryParams(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-mono text-sm resize-none"
            />
          </div>

          {(method === 'POST' || method === 'PUT') && (
            <div>
              <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Request Body (JSON)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-mono text-sm resize-none"
                placeholder="{}"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold uppercase text-shell-600 dark:text-gray-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none"
              placeholder="weather, forecast, api"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-shell-200 dark:bg-gray-700 text-shell-700 dark:text-gray-300 font-bold uppercase border-2 border-black dark:border-gray-600 hover:bg-shell-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-lobster-500 hover:bg-lobster-600 text-white font-bold uppercase border-2 border-black transition-colors"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              {initialData ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function RequestTemplatesPage() {
  const {
    templates,
    communityTemplates,
    allTemplates,
    categories,
    allTags,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    importTemplate,
    exportTemplate,
    duplicateTemplate
  } = useRequestTemplates();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'community' | 'my'>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('popular');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RequestTemplate | null>(null);
  const [importJson, setImportJson] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Handle URL import parameter
  useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const importData = params.get('import');
      if (importData) {
        try {
          const decoded = JSON.parse(atob(importData));
          setEditingTemplate(decoded);
          setShowCreateModal(true);
          // Clear URL param
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          console.error('Failed to import from URL:', e);
        }
      }
    }
  }, []);

  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Source filter
    if (selectedSource === 'community') {
      filtered = communityTemplates;
    } else if (selectedSource === 'my') {
      filtered = templates;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Method filter
    if (selectedMethod !== 'all') {
      filtered = filtered.filter(t => t.method === selectedMethod);
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.agentName.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [allTemplates, communityTemplates, templates, selectedCategory, selectedSource, selectedMethod, search, sortBy]);

  const handleExport = (id: string) => {
    const json = exportTemplate(id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    try {
      importTemplate(importJson);
      setImportJson('');
      setShowImportModal(false);
    } catch (e) {
      alert('Invalid JSON format');
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Developer Tools', href: '/guides' },
    { label: 'Request Templates', href: '/request-templates' }
  ];

  return (
    <main className="min-h-screen bg-brutal-yellow dark:bg-gray-900 text-black dark:text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-500/10 border-4 border-lobster-500 text-lobster-600 dark:text-lobster-400 text-sm mb-6 font-bold uppercase"
            style={{ boxShadow: '4px 4px 0px 0px #e11d48' }}
          >
            <DocumentTextIcon className="w-4 h-4" />
            Reusable API Configurations
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase mb-4"
          >
            Request Templates
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-shell-600 dark:text-gray-400 max-w-2xl mx-auto mb-6"
          >
            Save, share, and reuse API request configurations. Browse community templates 
            or create your own for quick access in the playground.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <DocumentDuplicateIcon className="w-5 h-5 text-lobster-500" />
              <span className="font-bold">{communityTemplates.length} Community</span>
            </div>
            <div className="flex items-center gap-2">
              <BookmarkSolidIcon className="w-5 h-5 text-amber-500" />
              <span className="font-bold">{templates.length} My Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-green-500" />
              <span className="font-bold">{categories.length} Categories</span>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-shell-500 dark:text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-medium"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => { setEditingTemplate(null); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-lobster-500 hover:bg-lobster-600 text-white font-bold uppercase border-2 border-black transition-colors"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <PlusIcon className="w-5 h-5" />
            Create
          </button>

          {/* Import Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-shell-200 dark:bg-gray-700 hover:bg-shell-300 dark:hover:bg-gray-600 text-shell-700 dark:text-gray-300 font-bold uppercase border-2 border-black dark:border-gray-600 transition-colors"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Import
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Source Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase text-shell-600 dark:text-gray-500">Source:</span>
            <div className="flex">
              {(['all', 'community', 'my'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source)}
                  className={`px-3 py-1.5 text-sm font-bold uppercase border-2 border-l-0 first:border-l-2 transition-colors ${
                    selectedSource === source
                      ? 'bg-lobster-500 text-white border-black'
                      : 'bg-shell-200 dark:bg-gray-800 text-shell-600 dark:text-gray-400 border-black dark:border-gray-600 hover:bg-shell-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {source === 'my' ? 'My Templates' : source.charAt(0).toUpperCase() + source.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase text-shell-600 dark:text-gray-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-sm bg-shell-200 dark:bg-gray-800 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-bold"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase text-shell-600 dark:text-gray-500">Method:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-1.5 text-sm bg-shell-200 dark:bg-gray-800 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-bold"
            >
              <option value="all">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-bold uppercase text-shell-600 dark:text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-sm bg-shell-200 dark:bg-gray-800 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-bold"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-shell-600 dark:text-gray-500 mb-4">
          Showing <span className="font-bold text-black dark:text-white">{filteredTemplates.length}</span> templates
        </p>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-lobster-500" />
            <p className="text-shell-600 dark:text-gray-400 mt-4">Loading templates...</p>
          </div>
        ) : filteredTemplates.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isCommunity={communityTemplates.some(t => t.id === template.id)}
                  onUse={() => incrementUsage(template.id)}
                  onDuplicate={() => duplicateTemplate(template.id)}
                  onExport={() => handleExport(template.id)}
                  onEdit={!communityTemplates.some(t => t.id === template.id) ? () => {
                    setEditingTemplate(template);
                    setShowCreateModal(true);
                  } : undefined}
                  onDelete={!communityTemplates.some(t => t.id === template.id) ? () => {
                    if (confirm('Delete this template?')) {
                      deleteTemplate(template.id);
                    }
                  } : undefined}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-shell-100 dark:bg-gray-800/50 border-4 border-dashed border-shell-300 dark:border-gray-700">
            <DocumentTextIcon className="w-12 h-12 mx-auto text-shell-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">No templates found</h3>
            <p className="text-shell-600 dark:text-gray-400 mb-4">
              {search || selectedCategory !== 'all' || selectedSource !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first template to get started'}
            </p>
            <button
              onClick={() => { setEditingTemplate(null); setShowCreateModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-500 hover:bg-lobster-600 text-white font-bold border-2 border-black transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create Template
            </button>
          </div>
        )}

        {/* Related Tools */}
        <section className="mt-16 pt-8 border-t-4 border-black dark:border-gray-800">
          <h2 className="text-xl font-black uppercase mb-6">Related Tools</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <a href="/api-playground" className="group bg-shell-100 dark:bg-gray-800/50 border-4 border-black dark:border-gray-700 p-4 hover:border-lobster-500 transition-all">
              <span className="text-2xl">🎮</span>
              <h3 className="font-bold mt-2 group-hover:text-lobster-500">API Playground</h3>
              <p className="text-sm text-shell-600 dark:text-gray-400 mt-1">Test templates live</p>
            </a>
            <a href="/simulator" className="group bg-shell-100 dark:bg-gray-800/50 border-4 border-black dark:border-gray-700 p-4 hover:border-lobster-500 transition-all">
              <span className="text-2xl">🧪</span>
              <h3 className="font-bold mt-2 group-hover:text-lobster-500">Request Simulator</h3>
              <p className="text-sm text-shell-600 dark:text-gray-400 mt-1">Build requests step-by-step</p>
            </a>
            <a href="/snippets" className="group bg-shell-100 dark:bg-gray-800/50 border-4 border-black dark:border-gray-700 p-4 hover:border-lobster-500 transition-all">
              <span className="text-2xl">📋</span>
              <h3 className="font-bold mt-2 group-hover:text-lobster-500">Code Snippets</h3>
              <p className="text-sm text-shell-600 dark:text-gray-400 mt-1">Copy-paste examples</p>
            </a>
            <a href="/export" className="group bg-shell-100 dark:bg-gray-800/50 border-4 border-black dark:border-gray-700 p-4 hover:border-lobster-500 transition-all">
              <span className="text-2xl">📤</span>
              <h3 className="font-bold mt-2 group-hover:text-lobster-500">Collection Export</h3>
              <p className="text-sm text-shell-600 dark:text-gray-400 mt-1">Postman, Insomnia, OpenAPI</p>
            </a>
          </div>
        </section>
      </div>

      {/* Create/Edit Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingTemplate(null); }}
        onSave={(data) => {
          if (editingTemplate && !communityTemplates.some(t => t.id === editingTemplate.id)) {
            updateTemplate(editingTemplate.id, data);
          } else {
            addTemplate(data);
          }
        }}
        initialData={editingTemplate || undefined}
      />

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowImportModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-shell-100 dark:bg-gray-800 border-4 border-black dark:border-gray-600 p-6"
            style={{ boxShadow: '8px 8px 0px 0px #000' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black uppercase">Import Template</h2>
              <button onClick={() => setShowImportModal(false)} className="p-1 hover:text-lobster-500">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-shell-600 dark:text-gray-400 mb-4">
              Paste a template JSON to import it to your library.
            </p>

            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-600 text-black dark:text-white focus:border-lobster-500 outline-none font-mono text-sm resize-none mb-4"
              placeholder='{"name": "My Template", ...}'
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-shell-200 dark:bg-gray-700 text-shell-700 dark:text-gray-300 font-bold uppercase border-2 border-black dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="flex-1 px-4 py-2 bg-lobster-500 hover:bg-lobster-600 disabled:opacity-50 text-white font-bold uppercase border-2 border-black transition-colors"
              >
                Import
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
