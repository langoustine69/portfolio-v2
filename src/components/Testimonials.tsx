'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  platform?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    quote: "The AFL agent saved me hours of manual data collection. One API call, instant stats. The x402 micropayment model is brilliant - I only pay for what I use.",
    author: "Alex Chen",
    role: "Sports Analytics Developer",
    avatar: "👨‍💻",
    platform: "X",
  },
  {
    id: '2',
    quote: "Space weather data that actually works. Integrated the solar flare agent into our satellite ops dashboard in under an hour. Clean API, fair pricing.",
    author: "Dr. Sarah Mitchell",
    role: "Aerospace Engineer",
    avatar: "🚀",
    platform: "GitHub",
  },
  {
    id: '3',
    quote: "Finally, crypto sentiment analysis without subscription bloat. Pay-per-request is exactly what indie devs need. The DeFi agents are my go-to.",
    author: "Marcus Webb",
    role: "DeFi Developer",
    avatar: "⛓️",
    platform: "Discord",
  },
  {
    id: '4',
    quote: "Built a fantasy sports app using the NFL agent. Real-time player stats with zero infrastructure overhead. This is how APIs should work.",
    author: "Jordan Lee",
    role: "App Developer",
    avatar: "📱",
    platform: "X",
  },
  {
    id: '5',
    quote: "The F1 telemetry agent powers our race prediction model. Sub-second response times, always fresh data. Highly recommend.",
    author: "Emma Rodriguez",
    role: "Data Scientist",
    avatar: "📊",
    platform: "LinkedIn",
  },
  {
    id: '6',
    quote: "x402 micropayments are the future. No more monthly minimums or API key hassles. Just instant value exchange.",
    author: "Dev_Anonymous",
    role: "Blockchain Developer",
    avatar: "🔐",
    platform: "X",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-shell-100 mb-2">
            What Developers Say
          </h2>
          <p className="text-shell-400">
            Real feedback from our API users
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="relative bg-shell-800/50 border border-shell-700 rounded-2xl p-8 md:p-12 mb-8">
          <div className="absolute top-6 left-6 text-6xl text-lobster-500/20 font-serif">"</div>
          
          <div className="relative z-10">
            <p className="text-lg md:text-xl text-shell-200 mb-6 leading-relaxed">
              {testimonials[activeIndex].quote}
            </p>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-shell-700 rounded-full flex items-center justify-center text-2xl">
                {testimonials[activeIndex].avatar}
              </div>
              <div>
                <p className="text-shell-100 font-medium">
                  {testimonials[activeIndex].author}
                </p>
                <p className="text-shell-400 text-sm">
                  {testimonials[activeIndex].role}
                </p>
              </div>
              {testimonials[activeIndex].platform && (
                <span className="ml-auto text-xs text-shell-500 bg-shell-800 px-3 py-1 rounded-full border border-shell-700">
                  via {testimonials[activeIndex].platform}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'bg-lobster-500 w-6'
                  : 'bg-shell-600 hover:bg-shell-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Mini cards preview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testimonials
            .filter((_, i) => i !== activeIndex)
            .slice(0, 3)
            .map((t, index) => (
              <button
                key={t.id}
                onClick={() => goToSlide(testimonials.findIndex(test => test.id === t.id))}
                className="bg-shell-800/30 border border-shell-700/50 rounded-xl p-4 text-left hover:border-lobster-500/30 transition-all group"
              >
                <p className="text-shell-400 text-sm line-clamp-2 mb-3 group-hover:text-shell-300">
                  "{t.quote.slice(0, 80)}..."
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.avatar}</span>
                  <span className="text-shell-500 text-xs">{t.author}</span>
                </div>
              </button>
            ))}
        </div>

        {/* Social proof stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '50K+', label: 'API Requests/Day' },
            { value: '99.9%', label: 'Uptime' },
            { value: '<100ms', label: 'Avg Response' },
            { value: '24/7', label: 'Always Available' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 bg-shell-900/50 rounded-xl border border-shell-800"
            >
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-shell-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
