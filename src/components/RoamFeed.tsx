'use client';

/**
 * RoamFeed — premium cinematic redesign
 *
 * All data fetching, pagination, IntersectionObservers, autoplay
 * activation logic, and routing are unchanged from the original.
 * Only markup/styling/motion has been reworked.
 *
 * Requires: framer-motion, lucide-react (already used in the original)
 *   npm install framer-motion
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import MediaPlayer from './MediaPlayer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BadgeCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface MediaItem {
  _id: string;
  type: 'video' | 'image';
  sourceType: 'cloudinary' | 'youtube';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  placeId: {
    _id: string;
    name: string;
    location: { coordinates: number[] };
  };
  // Optional presentational fields — rendered only if present in the API
  // response. Nothing here changes the fetch/shape contract.
  category?: string;
  distanceKm?: number;
  creator?: {
    name: string;
    avatarUrl?: string;
    verified?: boolean;
  };
}

/** Category → gradient + emoji, purely presentational */
const CATEGORY_STYLES: Record<string, { emoji: string; gradient: string }> = {
  beach: { emoji: '🏖', gradient: 'from-sky-400 to-cyan-500' },
  nature: { emoji: '🌿', gradient: 'from-emerald-400 to-teal-500' },
  heritage: { emoji: '🏰', gradient: 'from-orange-400 to-amber-500' },
  food: { emoji: '🍜', gradient: 'from-rose-400 to-orange-400' },
  trekking: { emoji: '🥾', gradient: 'from-emerald-500 to-lime-500' },
  default: { emoji: '✨', gradient: 'from-slate-400 to-slate-500' },
};

function getCategoryStyle(category?: string) {
  if (!category) return CATEGORY_STYLES.default;
  return CATEGORY_STYLES[category.toLowerCase()] ?? CATEGORY_STYLES.default;
}

/** Small glass icon button used on the right-hand action rail */
function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.86 }}
      whileHover={{ scale: 1.08 }}
      className={`group relative flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-xl transition-colors duration-300
        ${active
          ? 'border-white/20 bg-white/25 text-white shadow-[0_0_20px_rgba(255,255,255,0.25)]'
          : 'border-white/10 bg-black/20 text-white/90 hover:bg-white/15'}
      `}
    >
      <span className="absolute inset-0 rounded-full bg-white/0 transition group-hover:bg-white/5" />
      {icon}
    </motion.button>
  );
}

/** Skeleton card shown while the first page of media is loading */
function SkeletonSlide() {
  return (
    <div className="relative h-[100dvh] w-full snap-start overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 space-y-3 p-6">
        <div className="h-5 w-24 rounded-full bg-white/10" />
        <div className="h-7 w-2/3 rounded-md bg-white/10" />
        <div className="h-4 w-4/5 rounded-md bg-white/5" />
      </div>
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

/** Empty state shown when the feed has no items and isn't loading */
function EmptyState() {
  return (
    <div className="flex h-[100dvh] w-full snap-start flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-950 to-black px-8 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
      >
        <Compass className="h-9 w-9 text-emerald-400" strokeWidth={1.5} />
      </motion.div>
      <h2 className="text-xl font-semibold tracking-tight text-white">
        Nothing to discover yet
      </h2>
      <p className="max-w-xs text-sm text-white/50">
        New places around Karnataka show up here as soon as they&apos;re added. Check back soon.
      </p>
    </div>
  );
}

export default function RoamFeed() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Intersection Observer to detect which video is currently in view
  const feedObserver = useRef<IntersectionObserver | null>(null);

  const feedCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      // 0.4 threshold ensures it triggers even with mobile URL bars changing screen height
      if (entry.isIntersecting) {
        console.log('ACTIVE VIDEO:', entry.target.getAttribute('data-id'));
        setActiveId(entry.target.getAttribute('data-id'));
      }
    });
  }, []);

  useEffect(() => {
    feedObserver.current = new IntersectionObserver(feedCallback, { threshold: 0.4 });
    return () => feedObserver.current?.disconnect();
  }, [feedCallback]);

  const fetchMedia = async (skipCount: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/media/roam?limit=5&skip=${skipCount}`);
      const data = await res.json();
      if (data.success) {
        setItems(prev => [...prev, ...data.data]);
        setHasMore(data.pagination.hasMore);

        // Auto-play the first item if nothing is active yet
        if (skipCount === 0 && data.data.length > 0 && !activeId) {
          setActiveId(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch roam feed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          const nextSkip = skip + 5;
          setSkip(nextSkip);
          fetchMedia(nextSkip);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, skip]
  );

  const showEmptyState = !loading && items.length === 0;

  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-md bg-black md:max-w-lg">
      {/* Floating glass header — fixed height so it can never grow into
          the media controls below it, regardless of text length/wrapping */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 overflow-hidden px-4 pt-[env(safe-area-inset-top)]">
        <div className="pointer-events-auto flex max-w-[65%] items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-xl shadow-lg shadow-black/20">
          <span className="shrink-0 text-base font-bold tracking-tight text-white">Roam</span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-white/30" />
          <span className="truncate text-sm font-medium text-white/70">Discover Karnataka</span>
        </div>

        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-xl transition hover:bg-white/15 active:scale-95"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Filters"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-xl transition hover:bg-white/15 active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = activeId === item._id;
          const categoryStyle = getCategoryStyle(item.category);

          return (
            <div
              key={item._id}
              data-id={item._id}
              ref={node => {
                if (isLast) lastElementRef(node as HTMLDivElement);
                if (node) feedObserver.current?.observe(node);
              }}
              className="relative flex h-[100dvh] w-full snap-start snap-always flex-col overflow-hidden bg-zinc-950 md:my-2 md:h-[calc(100dvh-1rem)] md:rounded-[2rem] md:shadow-2xl md:shadow-black/50"
            >
              {/* Media — hero layer, untouched functionality */}
              <div className="absolute inset-0 h-full w-full">
                <MediaPlayer {...item} isActive={isActive} />
              </div>

              {/* Cinematic gradient wash, replaces flat black overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />

              {/* Category badge */}
              {item.category && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`absolute left-4 top-24 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r ${categoryStyle.gradient} px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-black/30`}
                >
                  <span>{categoryStyle.emoji}</span>
                  <span>{item.category}</span>
                </motion.div>
              )}

              {/* Right-side floating action rail */}
              <div className="absolute right-3 bottom-40 z-20 flex flex-col items-center gap-4 md:bottom-44">
                <ActionButton icon={<Heart className="h-5 w-5" />} label="Like" />
                <ActionButton icon={<MessageCircle className="h-5 w-5" />} label="Comment" />
                <ActionButton icon={<Share2 className="h-5 w-5" />} label="Share" />
                <ActionButton icon={<Bookmark className="h-5 w-5" />} label="Save" />
              </div>

              {/* Bottom glass info card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.9, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 mt-auto w-full px-4 pb-6"
              >
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5 pr-20 backdrop-blur-xl shadow-2xl shadow-black/40 md:pr-24">
                  {/* Creator mini card */}
                  {item.creator && (
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10">
                        {item.creator.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.creator.avatarUrl}
                            alt={item.creator.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                            {item.creator.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-sm font-medium text-white/90">
                        {item.creator.name}
                        {item.creator.verified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-sky-400" />
                        )}
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold tracking-tight text-white [text-wrap:balance]">
                    {item.title || 'Untitled'}
                  </h3>

                  {item.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/70">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    {item.placeId?.name && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.placeId.name}
                      </span>
                    )}
                    {typeof item.distanceKm === 'number' && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span>{item.distanceKm.toFixed(1)} km away</span>
                      </>
                    )}
                  </div>

                  {item.placeId && (
                    <Link
                      href={`/map?lat=${item.placeId.location.coordinates[1]}&lng=${item.placeId.location.coordinates[0]}&placeId=${item.placeId._id}`}
                      className="group mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] active:scale-95"
                    >
                      <MapPin className="h-4 w-4" />
                      Explore on Map
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}

        {showEmptyState && <EmptyState />}
        {loading && items.length === 0 && <SkeletonSlide />}
        {loading && items.length > 0 && (
          <div className="flex h-24 w-full snap-start items-center justify-center gap-2 text-white/60">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
          </div>
        )}
      </div>
    </div>
  );
}
