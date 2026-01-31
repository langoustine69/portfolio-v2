'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Agent, getLiveAgents } from '@/data/agents';

interface FeaturedCarouselProps {
  autoPlayInterval?: number;
  showControls?: boolean;
}

export default function FeaturedCarousel({ 
  autoPlayInterval = 4000,
  showControls = true 
}: FeaturedCarouselProps) {
  const featuredAgents = getLiveAgents().slice(0, 8); // Top 8 live agents
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % featuredAgents.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [featuredAgents.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + featuredAgents.length) % featuredAgents.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [featuredAgents.length, isTransitioning]);

  const goToIndex = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentIndex, isTransitioning]);

  // Auto-play
  useEffect(() => {
    if (isPaused || !autoPlayInterval) return;
    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  if (featuredAgents.length === 0) return null;

  const currentAgent = featuredAgents[currentIndex];

  return (
    <div 
      ref={carouselRef}
      className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-shell-900 via-shell-900/95 to-lobster-950/30 border border-shell-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Featured Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lobster-500/20 text-lobster-400 rounded-full text-sm font-medium border border-lobster-500/30">
          <span className="w-2 h-2 bg-lobster-500 rounded-full animate-pulse" />
          Featured Agents
        </span>
      </div>

      {/* Main Content */}
      <div className="relative p-8 pt-16 md:p-12 md:pt-16">
        <div 
          className="transition-all duration-500 ease-out"
          style={{ opacity: isTransitioning ? 0.7 : 1, transform: isTransitioning ? 'translateX(10px)' : 'translateX(0)' }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            {/* Agent Icon */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-lobster-500/20 to-coral-500/10 border border-lobster-500/30 flex items-center justify-center">
                <span className="text-5xl md:text-6xl">{currentAgent.icon}</span>
              </div>
            </div>

            {/* Agent Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl md:text-3xl font-bold text-shell-100 truncate">
                  {currentAgent.name}
                </h3>
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Live
                </span>
              </div>
              
              <p className="text-shell-400 text-lg mb-4 line-clamp-2">
                {currentAgent.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-shell-800/50 text-shell-300 rounded-lg text-sm border border-shell-700">
                  {currentAgent.category}
                </span>
                <span className="text-shell-500 text-sm">
                  via {currentAgent.apiSource}
                </span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentAgent.features.slice(0, 4).map((feature, i) => (
                  <span 
                    key={i}
                    className="px-2.5 py-1 bg-shell-800/30 text-shell-400 rounded text-sm border border-shell-700/50"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/agents/${currentAgent.id}`}
                  className="inline-flex items-center gap-2 bg-lobster-600 hover:bg-lobster-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                  View Agent
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                {currentAgent.railwayUrl && (
                  <a
                    href={currentAgent.railwayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-shell-800 hover:bg-shell-700 text-shell-200 px-5 py-2.5 rounded-lg font-medium transition-colors border border-shell-700"
                  >
                    Try API
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          {/* Arrow Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-shell-800/80 hover:bg-shell-700 text-shell-300 hover:text-white transition-all border border-shell-700 backdrop-blur-sm"
            aria-label="Previous agent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-shell-800/80 hover:bg-shell-700 text-shell-300 hover:text-white transition-all border border-shell-700 backdrop-blur-sm"
            aria-label="Next agent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {featuredAgents.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-6 bg-lobster-500' 
                    : 'bg-shell-600 hover:bg-shell-500'
                }`}
                aria-label={`Go to agent ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Progress Bar */}
      {autoPlayInterval && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-shell-800">
          <div 
            className="h-full bg-gradient-to-r from-lobster-600 to-coral-500 transition-none"
            style={{
              animation: `progress ${autoPlayInterval}ms linear infinite`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
