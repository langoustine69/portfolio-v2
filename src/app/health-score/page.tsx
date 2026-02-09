'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  category: string;
  weight: number; // 1-3 importance
  options: {
    label: string;
    score: number; // 0-100
    feedback: string;
  }[];
}

const questions: Question[] = [
  // Error Handling
  {
    id: 'error-handling',
    question: 'How do you handle API errors (4xx/5xx)?',
    category: 'Error Handling',
    weight: 3,
    options: [
      { label: 'No error handling - app crashes', score: 0, feedback: 'Critical: Implement try/catch blocks and error boundaries. Users should never see raw errors.' },
      { label: 'Basic try/catch, generic error message', score: 40, feedback: 'Good start. Add specific handling for different error codes (402, 429, 500).' },
      { label: 'Different handling for different error codes', score: 70, feedback: 'Solid. Consider adding user-actionable messages for each error type.' },
      { label: 'Full error handling with user-friendly messages and recovery options', score: 100, feedback: 'Excellent! Your users get clear guidance on what went wrong and how to fix it.' },
    ],
  },
  {
    id: 'rate-limiting',
    question: 'How do you handle rate limits (429)?',
    category: 'Error Handling',
    weight: 3,
    options: [
      { label: 'No handling - requests just fail', score: 0, feedback: 'Critical: Implement rate limit handling or your app will break under load.' },
      { label: 'Show error to user when rate limited', score: 30, feedback: 'Better than nothing. Add automatic retry with backoff for seamless UX.' },
      { label: 'Automatic retry after delay', score: 70, feedback: 'Good. Use exponential backoff (1s, 2s, 4s, 8s) for optimal recovery.' },
      { label: 'Exponential backoff with jitter + request queuing', score: 100, feedback: 'Perfect! Your app handles traffic spikes gracefully.' },
    ],
  },
  // x402 Payment Flow
  {
    id: 'payment-handling',
    question: 'How do you handle 402 Payment Required responses?',
    category: 'x402 Payments',
    weight: 3,
    options: [
      { label: 'Not implemented yet', score: 0, feedback: 'Critical: x402 payments are how agents get paid. Implement the payment flow.' },
      { label: 'Basic payment signing, manual retry', score: 50, feedback: 'Works but friction. Auto-retry after payment for seamless UX.' },
      { label: 'Auto-retry after payment, success handling', score: 80, feedback: 'Great flow. Add balance pre-check and spending limits for better UX.' },
      { label: 'Full flow: balance check, payment, auto-retry, receipt storage', score: 100, feedback: 'Production-ready payment implementation!' },
    ],
  },
  {
    id: 'balance-check',
    question: 'Do you check USDC balance before making paid requests?',
    category: 'x402 Payments',
    weight: 2,
    options: [
      { label: 'No - just try and handle failure', score: 30, feedback: 'Works but poor UX. Users see failed transaction errors.' },
      { label: 'Check once on app load', score: 60, feedback: 'Better. Consider checking before expensive operations.' },
      { label: 'Check before each paid request', score: 90, feedback: 'Great UX. Users get proactive "insufficient funds" warnings.' },
      { label: 'Real-time balance tracking with low-balance warnings', score: 100, feedback: 'Premium UX! Users always know their spending capacity.' },
    ],
  },
  // Caching & Performance
  {
    id: 'caching',
    question: 'Do you cache API responses?',
    category: 'Performance',
    weight: 2,
    options: [
      { label: 'No caching - always fetch fresh', score: 20, feedback: 'You\'re paying for the same data repeatedly. Add caching for stable data.' },
      { label: 'Browser/memory cache with no invalidation strategy', score: 50, feedback: 'Risky. Add TTL or invalidation to avoid stale data.' },
      { label: 'Cache with TTL based on data type', score: 80, feedback: 'Smart approach. Consider adding cache warming for critical data.' },
      { label: 'Intelligent caching: TTL, stale-while-revalidate, selective invalidation', score: 100, feedback: 'Optimal! Fast responses and controlled costs.' },
    ],
  },
  {
    id: 'request-dedup',
    question: 'Do you deduplicate concurrent identical requests?',
    category: 'Performance',
    weight: 2,
    options: [
      { label: 'No - each component fetches independently', score: 20, feedback: 'Wasting money on duplicate requests. Use a request cache or SWR.' },
      { label: 'Some deduplication at component level', score: 50, feedback: 'Partial solution. Centralize API calls for full dedup.' },
      { label: 'Request deduplication via shared state/cache', score: 90, feedback: 'Efficient! Multiple components share one request.' },
      { label: 'SWR/React Query with automatic dedup + background refresh', score: 100, feedback: 'Best practice implementation!' },
    ],
  },
  // Retry Logic
  {
    id: 'retry-logic',
    question: 'What retry strategy do you use for failed requests?',
    category: 'Reliability',
    weight: 3,
    options: [
      { label: 'No retries - fail immediately', score: 0, feedback: 'Critical: Transient failures are common. Always retry idempotent requests.' },
      { label: 'Simple retry (same delay)', score: 40, feedback: 'Can cause thundering herd. Use exponential backoff.' },
      { label: 'Exponential backoff (1s, 2s, 4s...)', score: 80, feedback: 'Good pattern. Add jitter to prevent synchronized retries.' },
      { label: 'Exponential backoff with jitter + max retries + circuit breaker', score: 100, feedback: 'Resilient implementation! Handles failures gracefully.' },
    ],
  },
  {
    id: 'timeouts',
    question: 'What request timeouts do you use?',
    category: 'Reliability',
    weight: 2,
    options: [
      { label: 'No timeout (default browser/library)', score: 20, feedback: 'Users could wait forever. Set explicit timeouts.' },
      { label: 'One timeout for all requests', score: 50, feedback: 'Different endpoints need different timeouts (quick lookups vs. heavy processing).' },
      { label: 'Different timeouts per endpoint type', score: 90, feedback: 'Smart approach! Tailor timeouts to expected response times.' },
      { label: 'Adaptive timeouts based on historical latency', score: 100, feedback: 'Advanced! Self-tuning for optimal UX.' },
    ],
  },
  // Monitoring
  {
    id: 'logging',
    question: 'How do you log API requests?',
    category: 'Monitoring',
    weight: 2,
    options: [
      { label: 'No logging', score: 0, feedback: 'Flying blind. You can\'t debug what you can\'t see.' },
      { label: 'Console.log in development only', score: 30, feedback: 'No production visibility. Add structured logging.' },
      { label: 'Structured logs with request/response metadata', score: 70, feedback: 'Good! Add correlation IDs to trace request flows.' },
      { label: 'Full observability: logs, metrics, traces with alerting', score: 100, feedback: 'Production-grade monitoring!' },
    ],
  },
  {
    id: 'spending-tracking',
    question: 'How do you track API spending?',
    category: 'Monitoring',
    weight: 2,
    options: [
      { label: 'No tracking', score: 0, feedback: 'Budget surprise incoming! Track your spending.' },
      { label: 'Check manually via dashboard', score: 40, feedback: 'Reactive approach. Add in-app tracking for real-time visibility.' },
      { label: 'In-app spend tracking with running totals', score: 80, feedback: 'Great! Consider adding budget limits and alerts.' },
      { label: 'Real-time tracking with budget limits, alerts, and forecasting', score: 100, feedback: 'Full cost control! No surprise bills.' },
    ],
  },
  // Security
  {
    id: 'input-validation',
    question: 'How do you validate user input before sending to APIs?',
    category: 'Security',
    weight: 3,
    options: [
      { label: 'Send directly without validation', score: 0, feedback: 'Security risk! Always validate and sanitize user input.' },
      { label: 'Basic type checking', score: 40, feedback: 'Minimal protection. Add length limits, format validation, sanitization.' },
      { label: 'Schema validation (Zod, Yup, etc.)', score: 80, feedback: 'Solid approach. Add sanitization for special characters.' },
      { label: 'Full validation: schema + sanitization + rate limiting per user', score: 100, feedback: 'Hardened against abuse!' },
    ],
  },
  {
    id: 'secrets-handling',
    question: 'How do you handle API keys and secrets?',
    category: 'Security',
    weight: 3,
    options: [
      { label: 'Hardcoded in source code', score: 0, feedback: 'Critical security risk! Never commit secrets. Use environment variables.' },
      { label: 'Environment variables', score: 70, feedback: 'Good practice. Ensure they\'re not exposed to client-side code.' },
      { label: 'Env vars + secret manager + rotation', score: 90, feedback: 'Excellent! Production-ready secret management.' },
      { label: 'Secret manager + auto-rotation + audit logging', score: 100, feedback: 'Enterprise-grade security!' },
    ],
  },
  // Testing
  {
    id: 'testing',
    question: 'How do you test your agent integration?',
    category: 'Testing',
    weight: 2,
    options: [
      { label: 'Manual testing only', score: 20, feedback: 'Risky. Add automated tests for critical paths.' },
      { label: 'Unit tests for API calls', score: 50, feedback: 'Good start. Add integration tests with mock servers.' },
      { label: 'Unit + integration tests with mocks', score: 80, feedback: 'Solid coverage. Consider adding E2E tests.' },
      { label: 'Full test suite: unit, integration, E2E, load testing', score: 100, feedback: 'Comprehensive testing strategy!' },
    ],
  },
  {
    id: 'error-testing',
    question: 'Do you test error scenarios?',
    category: 'Testing',
    weight: 2,
    options: [
      { label: 'No - just test happy path', score: 10, feedback: 'Errors will happen. Test 402, 429, 500, timeout scenarios.' },
      { label: 'Some error cases manually tested', score: 40, feedback: 'Better. Add automated tests for error handling.' },
      { label: 'Automated tests for common error scenarios', score: 80, feedback: 'Good coverage. Consider chaos engineering for edge cases.' },
      { label: 'Full error testing + chaos engineering + failover validation', score: 100, feedback: 'Battle-tested integration!' },
    ],
  },
];

const categories = ['Error Handling', 'x402 Payments', 'Performance', 'Reliability', 'Monitoring', 'Security', 'Testing'];

interface Answer {
  questionId: string;
  optionIndex: number;
}

export default function HealthScorePage() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, optionIndex };
        return updated;
      }
      return [...prev, { questionId, optionIndex }];
    });
  };

  const getAnswer = (questionId: string): number | undefined => {
    return answers.find(a => a.questionId === questionId)?.optionIndex;
  };

  const results = useMemo(() => {
    if (answers.length < questions.length) return null;

    let totalWeight = 0;
    let weightedScore = 0;
    const categoryScores: Record<string, { score: number; weight: number; feedback: string[] }> = {};

    categories.forEach(cat => {
      categoryScores[cat] = { score: 0, weight: 0, feedback: [] };
    });

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return;

      const option = question.options[answer.optionIndex];
      const weighted = option.score * question.weight;
      
      weightedScore += weighted;
      totalWeight += 100 * question.weight;

      categoryScores[question.category].score += weighted;
      categoryScores[question.category].weight += 100 * question.weight;
      
      if (option.score < 80) {
        categoryScores[question.category].feedback.push(option.feedback);
      }
    });

    const overallScore = Math.round((weightedScore / totalWeight) * 100);

    const categoryResults = Object.entries(categoryScores).map(([name, data]) => ({
      name,
      score: data.weight > 0 ? Math.round((data.score / data.weight) * 100) : 0,
      feedback: data.feedback,
    }));

    return {
      overall: overallScore,
      grade: getGrade(overallScore),
      categories: categoryResults,
    };
  }, [answers]);

  const progress = Math.round((answers.length / questions.length) * 100);

  if (showResults && results) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/" className="text-orange-500 hover:text-orange-600 mb-8 inline-flex items-center gap-2">
            ← Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">Integration Health Score</h1>
            <p className="text-gray-600 dark:text-gray-400">Your x402 integration assessment results</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 text-center">
            <div className={`text-8xl font-bold mb-2 ${getGradeColor(results.grade)}`}>
              {results.grade}
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {results.overall}/100
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {getGradeMessage(results.overall)}
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Category Breakdown</h2>
            <div className="space-y-4">
              {results.categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium dark:text-white">{cat.name}</span>
                    <span className={`font-bold ${getScoreColor(cat.score)}`}>{cat.score}/100</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getBarColor(cat.score)}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">🎯 Recommendations</h2>
            {results.categories
              .filter(cat => cat.feedback.length > 0)
              .map(cat => (
                <div key={cat.name} className="mb-6 last:mb-0">
                  <h3 className="font-bold text-lg mb-3 dark:text-white">{cat.name}</h3>
                  <ul className="space-y-2">
                    {cat.feedback.map((fb, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <span className="text-orange-500 mt-1">→</span>
                        <span>{fb}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            {results.categories.every(cat => cat.feedback.length === 0) && (
              <p className="text-green-600 dark:text-green-400 text-lg">
                🎉 Excellent! No major recommendations. Your integration is production-ready!
              </p>
            )}
          </div>

          {/* Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">📚 Helpful Resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ResourceLink href="/checklist" title="Production Checklist" desc="40+ items to verify before launch" />
              <ResourceLink href="/x402-flow" title="x402 Payment Flow" desc="Visual guide to micropayments" />
              <ResourceLink href="/errors" title="Error Code Reference" desc="Handle every error correctly" />
              <ResourceLink href="/security" title="Security Best Practices" desc="Harden your integration" />
              <ResourceLink href="/optimizer" title="Cost Optimizer" desc="Reduce your API spending" />
              <ResourceLink href="/sdk" title="SDK Generator" desc="Production-ready client code" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => { setAnswers([]); setShowResults(false); }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Retake Assessment
            </button>
            <button
              onClick={() => {
                const text = `My x402 Integration Health Score: ${results.grade} (${results.overall}/100) 🦞\n\nAssess your integration at langoustine69.dev/health-score`;
                navigator.clipboard.writeText(text);
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Share Results
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-orange-500 hover:text-orange-600 mb-8 inline-flex items-center gap-2">
          ← Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">🏥 Integration Health Score</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Assess your x402 agent integration quality. Answer {questions.length} questions to get 
            a personalized score and actionable recommendations.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{answers.length} of {questions.length} answered</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category}>
              <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                {getCategoryIcon(category)} {category}
              </h2>
              <div className="space-y-6">
                {questions
                  .filter(q => q.category === category)
                  .map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      selectedOption={getAnswer(question.id)}
                      onSelect={(optionIndex) => handleAnswer(question.id, optionIndex)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowResults(true)}
            disabled={answers.length < questions.length}
            className={`px-8 py-4 rounded-lg text-lg font-semibold transition ${
              answers.length >= questions.length
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {answers.length >= questions.length 
              ? 'Get My Health Score →'
              : `Answer ${questions.length - answers.length} more questions`}
          </button>
        </div>
      </div>
    </main>
  );
}

function QuestionCard({ 
  question, 
  selectedOption, 
  onSelect 
}: { 
  question: Question; 
  selectedOption?: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-lg dark:text-white pr-4">{question.question}</h3>
        {question.weight === 3 && (
          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full whitespace-nowrap">
            Critical
          </span>
        )}
      </div>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition ${
              selectedOption === index
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className={`${selectedOption === index ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResourceLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link 
      href={href}
      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 transition"
    >
      <div className="font-semibold dark:text-white">{title}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
    </Link>
  );
}

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-green-500';
    case 'B': return 'text-blue-500';
    case 'C': return 'text-yellow-500';
    case 'D': return 'text-orange-500';
    default: return 'text-red-500';
  }
}

function getGradeMessage(score: number): string {
  if (score >= 90) return 'Production-ready! Your integration is rock solid.';
  if (score >= 80) return 'Great job! A few improvements will make it excellent.';
  if (score >= 70) return 'Good foundation. Address the recommendations below.';
  if (score >= 60) return 'Needs work. Focus on critical items first.';
  return 'Significant improvements needed. Start with security and error handling.';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Error Handling': '🚨',
    'x402 Payments': '💳',
    'Performance': '⚡',
    'Reliability': '🔄',
    'Monitoring': '📊',
    'Security': '🛡️',
    'Testing': '🧪',
  };
  return icons[category] || '📋';
}
