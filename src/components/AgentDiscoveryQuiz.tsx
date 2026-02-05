'use client';

import { useState, useMemo } from 'react';
import { agents, Agent } from '@/data/agents';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    categories: string[];
    keywords: string[];
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'domain',
    question: 'What domain are you building in?',
    options: [
      { label: '💰 Finance & DeFi', value: 'finance', categories: ['DeFi', 'Finance'], keywords: ['price', 'market', 'trading', 'crypto'] },
      { label: '🌍 News & Intelligence', value: 'intelligence', categories: ['News', 'Intelligence', 'Geoscience'], keywords: ['news', 'events', 'alerts', 'tracking'] },
      { label: '🌤️ Weather & Environment', value: 'weather', categories: ['Weather', 'Environment', 'Geoscience'], keywords: ['weather', 'climate', 'forecast', 'natural'] },
      { label: '📝 Content & Language', value: 'content', categories: ['Language', 'Content'], keywords: ['word', 'text', 'language', 'writing'] },
      { label: '🔧 Developer Tools', value: 'devtools', categories: ['Developer', 'API', 'Tools'], keywords: ['api', 'developer', 'tools', 'utility'] },
      { label: '🎲 Something Else', value: 'other', categories: [], keywords: [] },
    ],
  },
  {
    id: 'usecase',
    question: 'What\'s your primary use case?',
    options: [
      { label: '🤖 Building an AI Agent', value: 'agent', categories: [], keywords: ['b2a', 'agent', 'automated'] },
      { label: '📊 Data Dashboard', value: 'dashboard', categories: [], keywords: ['overview', 'stats', 'dashboard'] },
      { label: '🔔 Alerts & Notifications', value: 'alerts', categories: [], keywords: ['alerts', 'notifications', 'monitoring'] },
      { label: '📱 Mobile/Web App', value: 'app', categories: [], keywords: ['real-time', 'lookup', 'search'] },
      { label: '📈 Research & Analysis', value: 'research', categories: [], keywords: ['analysis', 'report', 'research'] },
      { label: '🧪 Experimenting', value: 'experiment', categories: [], keywords: [] },
    ],
  },
  {
    id: 'frequency',
    question: 'How often will you call the API?',
    options: [
      { label: '⚡ Real-time (100+ req/min)', value: 'realtime', categories: [], keywords: [] },
      { label: '🔄 Frequently (10-100 req/min)', value: 'frequent', categories: [], keywords: [] },
      { label: '📆 Periodically (hourly/daily)', value: 'periodic', categories: [], keywords: [] },
      { label: '🎯 On-demand only', value: 'ondemand', categories: [], keywords: [] },
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you?',
    options: [
      { label: '💵 Low cost per request', value: 'cost', categories: [], keywords: [] },
      { label: '⚡ Speed & reliability', value: 'speed', categories: [], keywords: [] },
      { label: '📚 Rich data & features', value: 'features', categories: [], keywords: ['full', 'report', 'comprehensive'] },
      { label: '🔌 Easy integration', value: 'easy', categories: [], keywords: [] },
    ],
  },
];

interface QuizAnswer {
  questionId: string;
  value: string;
  categories: string[];
  keywords: string[];
}

function scoreAgent(agent: Agent, answers: QuizAnswer[]): number {
  let score = 0;
  
  // Status bonus (live agents get priority)
  if (agent.status === 'live') score += 50;
  if (agent.status === 'building') score += 10;
  
  for (const answer of answers) {
    // Category matching
    if (answer.categories.includes(agent.category)) {
      score += 30;
    }
    
    // Keyword matching in description and features
    const text = `${agent.description} ${agent.features.join(' ')}`.toLowerCase();
    for (const keyword of answer.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }
  }
  
  // Bonus for agents with more features
  score += Math.min(agent.features.length * 2, 20);
  
  // Bonus for agents with rate limits documented
  if (agent.rateLimit) score += 5;
  
  return score;
}

export function AgentDiscoveryQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [animating, setAnimating] = useState(false);

  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep) / quizQuestions.length) * 100;

  const handleAnswer = (option: QuizQuestion['options'][0]) => {
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      value: option.value,
      categories: option.categories,
      keywords: option.keywords,
    };
    
    const updatedAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id), newAnswer];
    setAnswers(updatedAnswers);
    
    setAnimating(true);
    setTimeout(() => {
      if (currentStep < quizQuestions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowResults(true);
      }
      setAnimating(false);
    }, 150);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnimating(false);
      }, 150);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResults(false);
  };

  const recommendedAgents = useMemo(() => {
    if (!showResults) return [];
    
    const scored = agents
      .map(agent => ({ agent, score: scoreAgent(agent, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return scored;
  }, [answers, showResults]);

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            🎯 Your Perfect Agents
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your answers, here are the best agents for you:
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {recommendedAgents.map(({ agent, score }, index) => (
            <Link 
              key={agent.id} 
              href={`/agents/${agent.id}`}
              className="block animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                index === 0 
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{agent.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {agent.name}
                      </h3>
                      {index === 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full">
                          Best Match
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        agent.status === 'live' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                        {agent.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Match: {Math.round((score / 150) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500 hidden sm:block">
                    →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={resetQuiz}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Start Over
          </button>
          <Link
            href="/agents"
            className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            Browse All Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Question {currentStep + 1} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className={`transition-opacity duration-150 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 text-left rounded-xl border transition-all ${
                answers.find(a => a.questionId === currentQuestion.id)?.value === option.value
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-gray-900 dark:text-white font-medium">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {currentStep > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={goBack}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ← Go back
          </button>
        </div>
      )}
    </div>
  );
}

export function AgentDiscoveryQuizCompact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
      >
        <span>🎯</span>
        <span>Find Your Agent</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎯 Agent Discovery Quiz
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AgentDiscoveryQuiz />
          </div>
        </div>
      )}
    </div>
  );
}
