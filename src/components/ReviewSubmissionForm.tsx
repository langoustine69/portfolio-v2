'use client';

import { useState } from 'react';
import { useUserReviews } from '@/hooks/useUserReviews';
import { agents } from '@/data/agents';

interface ReviewSubmissionFormProps {
  agentId?: string;
  agentName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function ReviewSubmissionForm({
  agentId,
  agentName,
  onSuccess,
  onCancel,
  compact = false,
}: ReviewSubmissionFormProps) {
  const { submitReview } = useUserReviews();
  const [isOpen, setIsOpen] = useState(compact);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    rating: 5,
    review: '',
    author: '',
    role: '',
    company: '',
    selectedAgent: agentId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.review.trim()) {
      setError('Please write a review');
      return;
    }
    if (!formData.author.trim()) {
      setError('Please enter your name');
      return;
    }
    if (formData.review.length < 20) {
      setError('Review must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);

    // Simulate slight delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const selectedAgentData = agents.find(a => a.id === formData.selectedAgent);
      
      submitReview({
        agentId: formData.selectedAgent || undefined,
        agentName: agentName || selectedAgentData?.name,
        rating: formData.rating,
        review: formData.review.trim(),
        author: formData.author.trim(),
        role: formData.role.trim() || undefined,
        company: formData.company.trim() || undefined,
      });

      setSubmitted(true);
      onSuccess?.();
      
      // Reset after showing success
      setTimeout(() => {
        setFormData({
          rating: 5,
          review: '',
          author: '',
          role: '',
          company: '',
          selectedAgent: agentId || '',
        });
        setSubmitted(false);
        if (!compact) setIsOpen(false);
      }, 3000);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
          className={`text-2xl transition-all hover:scale-110 ${
            star <= formData.rating ? 'text-yellow-400' : 'text-shell-600'
          }`}
          aria-label={`Rate ${star} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-lg font-semibold text-green-400 mb-2">
          Thank You for Your Review!
        </h3>
        <p className="text-shell-400 text-sm">
          Your feedback helps other developers discover our agents.
        </p>
      </div>
    );
  }

  if (!isOpen && !compact) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-shell-800/50 border border-shell-700 border-dashed rounded-xl p-6 hover:border-lobster-500/50 hover:bg-shell-800/70 transition-all group"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
          <div className="text-left">
            <p className="text-shell-200 font-medium">Share Your Experience</p>
            <p className="text-shell-500 text-sm">Help other developers by leaving a review</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-shell-800/50 border border-shell-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-shell-100">
          Write a Review
        </h3>
        {!compact && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onCancel?.();
            }}
            className="text-shell-500 hover:text-shell-300"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Agent Selection (if not pre-selected) */}
        {!agentId && (
          <div>
            <label className="block text-shell-300 text-sm font-medium mb-2">
              Which agent did you use?
            </label>
            <select
              value={formData.selectedAgent}
              onChange={(e) => setFormData(prev => ({ ...prev, selectedAgent: e.target.value }))}
              className="w-full bg-shell-900 border border-shell-700 rounded-lg px-4 py-2.5 text-shell-200 focus:border-lobster-500 focus:outline-none"
            >
              <option value="">General Feedback</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-shell-300 text-sm font-medium mb-2">
            Your Rating
          </label>
          <StarRating />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-shell-300 text-sm font-medium mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.review}
            onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
            placeholder="What did you build? How was your experience with the API?"
            rows={4}
            className="w-full bg-shell-900 border border-shell-700 rounded-lg px-4 py-2.5 text-shell-200 placeholder:text-shell-600 focus:border-lobster-500 focus:outline-none resize-none"
            maxLength={1000}
          />
          <p className="text-shell-600 text-xs mt-1">
            {formData.review.length}/1000 characters
          </p>
        </div>

        {/* Author Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-shell-300 text-sm font-medium mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="John Doe"
              className="w-full bg-shell-900 border border-shell-700 rounded-lg px-4 py-2.5 text-shell-200 placeholder:text-shell-600 focus:border-lobster-500 focus:outline-none"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-shell-300 text-sm font-medium mb-2">
              Your Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="Developer, Data Scientist, etc."
              className="w-full bg-shell-900 border border-shell-700 rounded-lg px-4 py-2.5 text-shell-200 placeholder:text-shell-600 focus:border-lobster-500 focus:outline-none"
              maxLength={50}
            />
          </div>
        </div>

        {/* Company (optional) */}
        <div>
          <label className="block text-shell-300 text-sm font-medium mb-2">
            Company / Organization
            <span className="text-shell-600 ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Acme Inc."
            className="w-full bg-shell-900 border border-shell-700 rounded-lg px-4 py-2.5 text-shell-200 placeholder:text-shell-600 focus:border-lobster-500 focus:outline-none"
            maxLength={50}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-lobster-600 hover:bg-lobster-500 disabled:bg-shell-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              Submitting...
            </>
          ) : (
            <>
              <span>📝</span>
              Submit Review
            </>
          )}
        </button>

        <p className="text-shell-600 text-xs text-center">
          Reviews are stored locally and help others discover our agents.
        </p>
      </div>
    </form>
  );
}
