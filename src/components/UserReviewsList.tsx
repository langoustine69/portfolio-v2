'use client';

import { useState } from 'react';
import { useUserReviews, UserReview } from '@/hooks/useUserReviews';
import ReviewSubmissionForm from './ReviewSubmissionForm';

interface UserReviewsListProps {
  agentId?: string;
  agentName?: string;
  showStats?: boolean;
  maxReviews?: number;
  showSubmitForm?: boolean;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-shell-700'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onHelpful,
  onReport,
  hasVoted,
}: {
  review: UserReview;
  onHelpful: () => void;
  onReport: () => void;
  hasVoted: boolean;
}) {
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-shell-800/30 border border-shell-700/50 rounded-xl p-5 hover:border-shell-600 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-lobster-600 to-lobster-800 rounded-full flex items-center justify-center text-white font-bold">
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-shell-100 font-medium">{review.author}</p>
            {(review.role || review.company) && (
              <p className="text-shell-500 text-sm">
                {review.role}
                {review.role && review.company && ' at '}
                {review.company}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <StarDisplay rating={review.rating} />
          <p className="text-shell-600 text-xs mt-1">{formatDate(review.createdAt)}</p>
        </div>
      </div>

      {review.agentName && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs bg-shell-700/50 text-shell-400 px-2 py-1 rounded-full">
            <span>🤖</span>
            {review.agentName}
          </span>
        </div>
      )}

      <p className="text-shell-300 leading-relaxed mb-4">{review.review}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={onHelpful}
          disabled={hasVoted}
          className={`flex items-center gap-2 text-sm transition-colors ${
            hasVoted
              ? 'text-lobster-400 cursor-default'
              : 'text-shell-500 hover:text-lobster-400'
          }`}
        >
          <span>👍</span>
          <span>Helpful{review.helpful > 0 && ` (${review.helpful})`}</span>
        </button>

        <div className="relative">
          {showReportConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-shell-600 text-xs">Report this?</span>
              <button
                onClick={() => {
                  onReport();
                  setShowReportConfirm(false);
                }}
                className="text-red-400 text-xs hover:text-red-300"
              >
                Yes
              </button>
              <button
                onClick={() => setShowReportConfirm(false)}
                className="text-shell-500 text-xs hover:text-shell-300"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowReportConfirm(true)}
              className="text-shell-600 hover:text-shell-400 text-xs"
            >
              Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingStats({
  averageRating,
  totalReviews,
  distribution,
}: {
  averageRating: number;
  totalReviews: number;
  distribution: Array<{ rating: number; count: number; percentage: number }>;
}) {
  return (
    <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Average Score */}
        <div className="text-center md:text-left md:pr-6 md:border-r md:border-shell-700">
          <div className="text-4xl font-bold text-shell-100 mb-1">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center md:justify-start mb-1">
            <StarDisplay rating={Math.round(averageRating)} />
          </div>
          <p className="text-shell-500 text-sm">{totalReviews} reviews</p>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {distribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-shell-500 text-sm w-6">{rating}★</span>
              <div className="flex-1 bg-shell-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-shell-600 text-xs w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserReviewsList({
  agentId,
  agentName,
  showStats = true,
  maxReviews,
  showSubmitForm = true,
}: UserReviewsListProps) {
  const {
    reviews,
    isLoading,
    markHelpful,
    reportReview,
    hasVoted,
    averageRating,
    ratingDistribution,
    totalReviews,
  } = useUserReviews(agentId);

  const [showAll, setShowAll] = useState(false);
  const displayedReviews = maxReviews && !showAll
    ? reviews.slice(0, maxReviews)
    : reviews;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-shell-800/30 rounded-xl h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {showStats && totalReviews > 0 && (
        <RatingStats
          averageRating={averageRating}
          totalReviews={totalReviews}
          distribution={ratingDistribution}
        />
      )}

      {/* Submit Form */}
      {showSubmitForm && (
        <ReviewSubmissionForm
          agentId={agentId}
          agentName={agentName}
        />
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <>
          <div className="space-y-4">
            {displayedReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpful={() => markHelpful(review.id)}
                onReport={() => reportReview(review.id)}
                hasVoted={hasVoted(review.id)}
              />
            ))}
          </div>

          {maxReviews && reviews.length > maxReviews && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 text-lobster-400 hover:text-lobster-300 text-sm font-medium transition-colors"
            >
              Show all {reviews.length} reviews →
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-shell-500">
          <p className="mb-2">No reviews yet</p>
          <p className="text-sm">Be the first to share your experience!</p>
        </div>
      )}
    </div>
  );
}
