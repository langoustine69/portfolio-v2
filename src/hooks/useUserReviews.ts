'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserReview {
  id: string;
  agentId?: string;
  agentName?: string;
  rating: number;
  review: string;
  author: string;
  role?: string;
  company?: string;
  platform?: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
  reported: boolean;
}

const STORAGE_KEY = 'langoustine69_user_reviews';
const HELPFUL_KEY = 'langoustine69_helpful_votes';

export function useUserReviews(agentId?: string) {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load reviews from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allReviews: UserReview[] = JSON.parse(stored);
        // Filter by agent if specified, exclude reported
        const filtered = allReviews.filter(r => 
          !r.reported && (!agentId || r.agentId === agentId)
        );
        setReviews(filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
      
      const votesStored = localStorage.getItem(HELPFUL_KEY);
      if (votesStored) {
        setHelpfulVotes(new Set(JSON.parse(votesStored)));
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    }
    setIsLoading(false);
  }, [agentId]);

  // Submit a new review
  const submitReview = useCallback((review: Omit<UserReview, 'id' | 'createdAt' | 'verified' | 'helpful' | 'reported'>): UserReview => {
    const newReview: UserReview = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      verified: false,
      helpful: 0,
      reported: false,
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const allReviews: UserReview[] = stored ? JSON.parse(stored) : [];
    allReviews.push(newReview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));

    setReviews(prev => [newReview, ...prev]);
    return newReview;
  }, []);

  // Mark review as helpful
  const markHelpful = useCallback((reviewId: string) => {
    if (helpfulVotes.has(reviewId)) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allReviews: UserReview[] = JSON.parse(stored);
      const idx = allReviews.findIndex(r => r.id === reviewId);
      if (idx !== -1) {
        allReviews[idx].helpful += 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
        
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
        ));
      }
    }

    const newVotes = new Set(helpfulVotes).add(reviewId);
    setHelpfulVotes(newVotes);
    localStorage.setItem(HELPFUL_KEY, JSON.stringify([...newVotes]));
  }, [helpfulVotes]);

  // Report a review
  const reportReview = useCallback((reviewId: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allReviews: UserReview[] = JSON.parse(stored);
      const idx = allReviews.findIndex(r => r.id === reviewId);
      if (idx !== -1) {
        allReviews[idx].reported = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    }
  }, []);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  return {
    reviews,
    isLoading,
    submitReview,
    markHelpful,
    reportReview,
    hasVoted: (id: string) => helpfulVotes.has(id),
    averageRating,
    ratingDistribution,
    totalReviews: reviews.length,
  };
}
