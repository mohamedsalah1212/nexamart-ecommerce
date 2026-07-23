'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch, cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  desktopImage: string;
  mobileImage: string | null;
}

const INTERVAL = 5000;

export function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    apiFetch('/banners/active').then(setBanners).catch(() => {});
  }, []);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setProgress(0);
    clearTimeout(autoRef.current!);
    clearInterval(progressRef.current!);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  // Auto-play + progress bar
  useEffect(() => {
    if (banners.length < 2) return;
    setProgress(0);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, 50);
    autoRef.current = setTimeout(() => {
      goTo((current + 1) % banners.length);
    }, INTERVAL);
    return () => {
      clearTimeout(autoRef.current!);
      clearInterval(progressRef.current!);
    };
  }, [current, banners.length]);

  // Fallback when no banners
  if (banners.length === 0) {
    return (
      <div className="relative mt-4 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-navy-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="relative z-10 px-8 md:px-16 py-16 md:py-24 max-w-2xl">
          <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mb-3">Welcome to NexaMart</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Premium Home &<br />Lifestyle Products
          </h1>
          <p className="mt-4 text-primary-100 text-base md:text-lg max-w-md">
            Discover smart gadgets and accessories for modern living.
          </p>
          <Link href="/products" className="mt-7 inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors shadow-lg">
            Shop Now <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const banner = banners[current];

  return (
    <div className="relative mt-4 rounded-2xl overflow-hidden group select-none">
      {/* Slides */}
      <div className="relative aspect-[21/9] md:aspect-[3/1] bg-gray-900 overflow-hidden">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-in-out',
              i === current
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-[1.02] z-0'
            )}
          >
            <img
              src={b.desktopImage}
              alt={b.title || ''}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-black/5" />
          </div>
        ))}

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-12">
          <div
            key={current}
            className="animate-slide-up"
            style={{ animation: 'slideUp 0.5s ease forwards' }}
          >
            {banner.title && (
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white max-w-xl leading-tight drop-shadow-md">
                {banner.title}
              </h2>
            )}
            {banner.subtitle && (
              <p className="mt-2 text-sm md:text-lg text-gray-200 max-w-lg drop-shadow">
                {banner.subtitle}
              </p>
            )}
            {banner.link && (
              <Link
                href={banner.link}
                className="mt-5 inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3 rounded-xl font-bold text-sm hover:bg-primary-50 hover:text-primary-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Shop Now <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 h-0.5 bg-white/20">
            <div
              className="h-full bg-white transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white shadow-lg hover:scale-110"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo((current + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white shadow-lg hover:scale-110"
          >
            <ChevronRight size={20} />
          </button>

          {/* Thumbnail dots */}
          <div className="absolute bottom-4 right-6 z-30 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'rounded-full transition-all duration-300 border border-white/40',
                  i === current
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

