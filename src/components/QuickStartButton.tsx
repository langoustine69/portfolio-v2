'use client';

import { useState } from 'react';
import QuickStartWizard from './QuickStartWizard';

export default function QuickStartButton() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsWizardOpen(true)}
        className="group bg-lobster-600 hover:bg-lobster-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-lobster-500/20 hover:shadow-lobster-500/40"
      >
        <span className="text-lg">🚀</span>
        <span>Quick Start</span>
        <svg 
          className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <QuickStartWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </>
  );
}
