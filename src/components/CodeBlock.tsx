'use client';

import { useState, useCallback } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  filename?: string;
}

export default function CodeBlock({ 
  code, 
  language = 'bash', 
  showLineNumbers = false,
  filename 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  const lines = code.split('\n');

  return (
    <div className="relative group">
      {/* Header with filename and copy button */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#333] rounded-t-lg">
          <span className="text-xs text-[#888] font-mono">{filename}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#888] hover:text-white bg-[#333] hover:bg-[#444] rounded transition-all"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      
      <pre className={`bg-[#0a0a0a] border border-[#222] ${filename ? 'rounded-b-lg border-t-0' : 'rounded-lg'} p-4 overflow-x-auto text-sm`}>
        {/* Copy button (floating, when no filename header) */}
        {!filename && (
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 text-xs text-[#666] hover:text-white bg-[#1a1a1a] hover:bg-[#333] border border-[#333] rounded opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        )}

        {showLineNumbers ? (
          <code className={`language-${language} text-[#e0e0e0] flex`}>
            <span className="select-none text-[#444] pr-4 text-right" style={{ minWidth: '2rem' }}>
              {lines.map((_, i) => (
                <span key={i} className="block">{i + 1}</span>
              ))}
            </span>
            <span className="flex-1">
              {lines.map((line, i) => (
                <span key={i} className="block">{line || ' '}</span>
              ))}
            </span>
          </code>
        ) : (
          <code className={`language-${language} text-[#e0e0e0]`}>{code}</code>
        )}
      </pre>
    </div>
  );
}
