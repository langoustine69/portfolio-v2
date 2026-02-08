'use client';

import { useState, useMemo } from 'react';
import { diffLines, diffWords, diffJson } from 'diff';
import { ClipboardDocumentIcon, ArrowsRightLeftIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

type DiffMode = 'lines' | 'words' | 'json';

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export default function DiffPage() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [mode, setMode] = useState<DiffMode>('json');
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

  const diffResult = useMemo(() => {
    if (!leftText && !rightText) return [];
    
    try {
      if (mode === 'json') {
        // Try to parse as JSON
        const leftJson = leftText.trim() ? JSON.parse(leftText) : {};
        const rightJson = rightText.trim() ? JSON.parse(rightText) : {};
        return diffJson(leftJson, rightJson);
      } else if (mode === 'words') {
        return diffWords(leftText, rightText);
      } else {
        return diffLines(leftText, rightText);
      }
    } catch {
      // Fall back to line diff if JSON parsing fails
      return diffLines(leftText, rightText);
    }
  }, [leftText, rightText, mode]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    diffResult.forEach((part: DiffPart) => {
      const lines = part.value.split('\n').filter(l => l.length > 0).length || 1;
      if (part.added) additions += lines;
      else if (part.removed) deletions += lines;
      else unchanged += lines;
    });

    return { additions, deletions, unchanged };
  }, [diffResult]);

  const handleSwap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
  };

  const handlePaste = async (side: 'left' | 'right') => {
    try {
      const text = await navigator.clipboard.readText();
      if (side === 'left') setLeftText(text);
      else setRightText(text);
    } catch {
      // Clipboard access denied
    }
  };

  const loadExample = () => {
    setLeftText(JSON.stringify({
      status: "success",
      data: {
        agentId: "crypto-price-feed",
        price: 42150.00,
        currency: "USD",
        timestamp: "2026-02-08T19:00:00Z"
      },
      meta: {
        responseTime: 145,
        cached: false
      }
    }, null, 2));
    
    setRightText(JSON.stringify({
      status: "success", 
      data: {
        agentId: "crypto-price-feed",
        price: 42175.50,
        currency: "USD",
        timestamp: "2026-02-08T19:01:00Z",
        change24h: 2.5
      },
      meta: {
        responseTime: 132,
        cached: true
      }
    }, null, 2));
    
    setMode('json');
  };

  const filteredResult = showOnlyDiffs 
    ? diffResult.filter((part: DiffPart) => part.added || part.removed)
    : diffResult;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ArrowsRightLeftIcon className="w-8 h-8 text-orange-500" />
            API Response Diff Tool
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Compare two API responses side-by-side. Paste responses to see differences highlighted.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as DiffMode)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="json">JSON</option>
                <option value="lines">Lines</option>
                <option value="words">Words</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyDiffs}
                onChange={(e) => setShowOnlyDiffs(e.target.checked)}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Show only differences</span>
            </label>

            <div className="flex-1" />

            <button
              onClick={loadExample}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Load Example
            </button>

            <button
              onClick={handleSwap}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowsRightLeftIcon className="w-4 h-4" />
              Swap
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Input Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Left Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
              <span className="font-medium text-red-700 dark:text-red-400">Original Response</span>
              <button
                onClick={() => handlePaste('left')}
                className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                Paste
              </button>
            </div>
            <textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder="Paste your first API response here..."
              className="w-full h-64 p-4 font-mono text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
            />
          </div>

          {/* Right Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
              <span className="font-medium text-green-700 dark:text-green-400">New Response</span>
              <button
                onClick={() => handlePaste('right')}
                className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                Paste
              </button>
            </div>
            <textarea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder="Paste your second API response here..."
              className="w-full h-64 p-4 font-mono text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Stats */}
        {(leftText || rightText) && (
          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-500"></span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-green-600 dark:text-green-400">{stats.additions}</span> additions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500"></span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-red-600 dark:text-red-400">{stats.deletions}</span> deletions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-400"></span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{stats.unchanged}</span> unchanged
              </span>
            </div>
          </div>
        )}

        {/* Diff Result */}
        {(leftText || rightText) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <span className="font-medium text-gray-900 dark:text-white">Diff Result</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                {filteredResult.length === 0 && showOnlyDiffs ? (
                  <span className="text-gray-500 dark:text-gray-400 italic">No differences found</span>
                ) : (
                  filteredResult.map((part: DiffPart, index: number) => (
                    <span
                      key={index}
                      className={
                        part.added
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                          : part.removed
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 line-through'
                          : 'text-gray-700 dark:text-gray-300'
                      }
                    >
                      {part.value}
                    </span>
                  ))
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!leftText && !rightText && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ArrowsRightLeftIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to Compare
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Paste two API responses above to see their differences highlighted.
            </p>
            <button
              onClick={loadExample}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              Try with Example
            </button>
          </div>
        )}

        {/* Use Cases */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔍 Debug API Changes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare responses before and after code changes to spot unintended modifications.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚡ Test Caching</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verify cache behavior by comparing cached vs fresh responses.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Track Data Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor how agent data changes over time by comparing snapshots.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">What diff modes are available?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <strong>JSON:</strong> Semantic comparison that understands JSON structure. <strong>Lines:</strong> Compare line by line. <strong>Words:</strong> Compare word by word for detailed changes.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Is my data stored anywhere?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                No! All comparisons happen locally in your browser. Nothing is sent to any server.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Can I compare non-JSON responses?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Yes! Switch to Lines or Words mode to compare any text format including XML, plain text, or logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
