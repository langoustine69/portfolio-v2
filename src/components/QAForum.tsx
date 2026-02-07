'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { qaQuestions, qaTags, QAQuestion, QAAnswer, QATagId } from '@/data/qa';

interface QAForumProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

type SortOption = 'newest' | 'votes' | 'unanswered';

const tagColors: Record<string, string> = {
  lobster: 'bg-lobster-500/20 text-lobster-400 border-lobster-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

export default function QAForum({ limit, showHeader = true, compact = false }: QAForumProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<QATagId | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('votes');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    let filtered = qaQuestions.filter((q) => {
      const matchesSearch =
        searchQuery === '' ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = activeTag === 'all' || q.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'votes':
        filtered = filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'unanswered':
        filtered = filtered.filter((q) => !q.solved).sort((a, b) => b.upvotes - a.upvotes);
        break;
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }, [searchQuery, activeTag, sortBy, limit]);

  const getTagStyle = (tagId: string) => {
    const tag = qaTags.find((t) => t.id === tagId);
    return tag ? tagColors[tag.color] || tagColors.blue : tagColors.blue;
  };

  const getTagLabel = (tagId: string) => {
    const tag = qaTags.find((t) => t.id === tagId);
    return tag?.label || tagId;
  };

  return (
    <section className={`${compact ? 'py-8' : 'py-16'} px-4`}>
      <div className="max-w-4xl mx-auto">
        {showHeader && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-600/10 border border-lobster-500/20 rounded-full text-lobster-400 text-sm mb-4">
              <span>💬</span>
              <span>Developer Q&A</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-shell-100 mb-3">
              Questions & Answers
            </h2>
            <p className="text-shell-400 max-w-2xl mx-auto">
              Get help from the community. Ask questions, share knowledge, and find solutions.
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-shell-500">🔍</span>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 bg-shell-800 border border-shell-700 rounded-xl text-shell-200 focus:outline-none focus:border-lobster-500/50 cursor-pointer"
            >
              <option value="votes">🔥 Most Votes</option>
              <option value="newest">🆕 Newest</option>
              <option value="unanswered">❓ Unanswered</option>
            </select>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTag === 'all'
                  ? 'bg-lobster-600 text-white'
                  : 'bg-shell-800 text-shell-400 hover:text-shell-200 border border-shell-700'
              }`}
            >
              All Topics
            </button>
            {qaTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  activeTag === tag.id
                    ? tagColors[tag.color]
                    : 'bg-shell-800 text-shell-400 hover:text-shell-200 border-shell-700'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              isExpanded={expandedQuestion === question.id}
              onToggle={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
              getTagStyle={getTagStyle}
              getTagLabel={getTagLabel}
            />
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 bg-shell-800/30 rounded-2xl border border-shell-700">
            <p className="text-shell-400 text-lg mb-2">No questions found</p>
            <p className="text-shell-500 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTag('all');
              }}
              className="mt-4 text-lobster-400 hover:text-lobster-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Ask Question CTA */}
        {!compact && (
          <div className="mt-10 p-6 bg-gradient-to-r from-lobster-600/10 to-shell-800/50 border border-lobster-500/20 rounded-2xl text-center">
            <h3 className="text-lg font-semibold text-shell-100 mb-2">Can't find what you're looking for?</h3>
            <p className="text-shell-400 text-sm mb-4">Ask the community! We're here to help.</p>
            <button className="px-6 py-3 bg-lobster-600 hover:bg-lobster-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-lobster-600/20">
              Ask a Question
            </button>
          </div>
        )}

        {limit && filteredQuestions.length >= limit && (
          <div className="mt-8 text-center">
            <Link
              href="/qa"
              className="inline-flex items-center gap-2 px-6 py-3 bg-shell-800 hover:bg-shell-700 border border-shell-700 text-shell-200 rounded-xl transition-all"
            >
              View All Questions
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

interface QuestionCardProps {
  question: QAQuestion;
  isExpanded: boolean;
  onToggle: () => void;
  getTagStyle: (tagId: string) => string;
  getTagLabel: (tagId: string) => string;
}

function QuestionCard({ question, isExpanded, onToggle, getTagStyle, getTagLabel }: QuestionCardProps) {
  const acceptedAnswer = question.answers.find((a) => a.accepted);

  return (
    <article className="bg-shell-800/50 border border-shell-700 rounded-2xl overflow-hidden hover:border-shell-600 transition-all">
      {/* Question Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lobster-500"
      >
        <div className="flex gap-4">
          {/* Vote/Answer Stats */}
          <div className="hidden sm:flex flex-col items-center gap-2 min-w-[60px]">
            <div className="text-center">
              <p className="text-xl font-bold text-shell-200">{question.upvotes}</p>
              <p className="text-xs text-shell-500">votes</p>
            </div>
            <div
              className={`text-center px-2 py-1 rounded-lg ${
                question.solved
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-shell-700/50'
              }`}
            >
              <p className={`text-lg font-bold ${question.solved ? 'text-green-400' : 'text-shell-400'}`}>
                {question.answers.length}
              </p>
              <p className={`text-xs ${question.solved ? 'text-green-500' : 'text-shell-500'}`}>
                {question.solved ? '✓ solved' : 'answers'}
              </p>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-shell-100 group-hover:text-lobster-400 transition-colors">
                {question.title}
              </h3>
              <span className="text-shell-500 text-sm shrink-0">{isExpanded ? '▲' : '▼'}</span>
            </div>

            {/* Mobile stats */}
            <div className="flex sm:hidden gap-4 mb-3 text-sm">
              <span className="text-shell-400">
                <span className="text-shell-200 font-medium">{question.upvotes}</span> votes
              </span>
              <span className={question.solved ? 'text-green-400' : 'text-shell-400'}>
                <span className={`font-medium ${question.solved ? 'text-green-300' : 'text-shell-200'}`}>
                  {question.answers.length}
                </span>{' '}
                {question.solved ? '✓ solved' : 'answers'}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 text-xs rounded-md border ${getTagStyle(tag)}`}
                >
                  {getTagLabel(tag)}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-sm text-shell-500">
              <div className="flex items-center gap-1.5">
                <span>{question.author.avatar}</span>
                <span className="text-shell-400">{question.author.name}</span>
              </div>
              <span>•</span>
              <span>{question.views} views</span>
              <span>•</span>
              <span>{question.createdAt}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-shell-700">
          {/* Question Body */}
          <div className="p-5 bg-shell-900/30">
            <div className="prose prose-invert prose-sm max-w-none">
              <div
                className="text-shell-300 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: formatContent(question.content),
                }}
              />
            </div>
          </div>

          {/* Answers */}
          {question.answers.length > 0 && (
            <div className="border-t border-shell-700">
              <div className="px-5 py-3 bg-shell-800/30">
                <h4 className="text-sm font-medium text-shell-400">
                  {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
                </h4>
              </div>
              <div className="divide-y divide-shell-700/50">
                {question.answers
                  .sort((a, b) => (b.accepted ? 1 : 0) - (a.accepted ? 1 : 0) || b.upvotes - a.upvotes)
                  .map((answer) => (
                    <AnswerCard key={answer.id} answer={answer} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function AnswerCard({ answer }: { answer: QAAnswer }) {
  return (
    <div
      className={`p-5 ${
        answer.accepted ? 'bg-green-500/5 border-l-2 border-green-500' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Vote Button */}
        <div className="hidden sm:flex flex-col items-center gap-1">
          <button className="p-1 text-shell-500 hover:text-lobster-400 transition-colors">
            ▲
          </button>
          <span className="text-shell-300 font-medium">{answer.upvotes}</span>
          {answer.accepted && (
            <span className="text-green-400 text-lg" title="Accepted Answer">
              ✓
            </span>
          )}
        </div>

        {/* Answer Content */}
        <div className="flex-1 min-w-0">
          {answer.accepted && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md mb-3">
              <span>✓</span>
              <span>Accepted Answer</span>
            </div>
          )}

          <div
            className="text-shell-300 text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: formatContent(answer.content),
            }}
          />

          {/* Author */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-shell-700/50">
            <span className="text-lg">{answer.author.avatar}</span>
            <div className="flex items-center gap-2">
              <span className="text-shell-300 text-sm font-medium">{answer.author.name}</span>
              {answer.author.verified && (
                <span className="px-1.5 py-0.5 bg-lobster-500/20 text-lobster-400 text-xs rounded">
                  ✓ Verified
                </span>
              )}
              {answer.author.handle && (
                <span className="text-shell-500 text-sm">{answer.author.handle}</span>
              )}
            </div>
            <span className="text-shell-500 text-sm ml-auto">{answer.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatContent(content: string): string {
  // Convert code blocks
  return content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-shell-900 p-4 rounded-lg overflow-x-auto my-3"><code class="text-lobster-300 text-xs">${escapeHtml(
        code.trim()
      )}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code class="bg-shell-700 px-1.5 py-0.5 rounded text-lobster-300">$1</code>')
    .replace(/\n/g, '<br />');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
