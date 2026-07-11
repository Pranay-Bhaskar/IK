
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import MediaPlayer from './MediaPlayer';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

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
}

export default function RoamFeed() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchMedia = async (skipCount: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/media/roam?limit=5&skip=${skipCount}`);
      const data = await res.json();
      if (data.success) {
        setItems(prev => [...prev, ...data.data]);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch roam feed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(0);
  }, []);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
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
  }, [loading, hasMore, skip]);

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] overflow-y-scroll snap-y snap-mandatory bg-black">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div 
            key={item._id} 
            ref={isLast ? lastElementRef : null}
            className="relative w-full h-[100dvh] snap-start bg-zinc-900 flex flex-col"
          >
            <div className="flex-1 relative">
              <MediaPlayer 
                type={item.type} 
                sourceType={item.sourceType} 
                url={item.url} 
                thumbnailUrl={item.thumbnailUrl} 
              />
            </div>
            
            {/* Overlay Info *}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
              <div className="flex-1 text-white pr-4">
                <h3 className="font-bold text-lg mb-1">{item.title || 'Untitled'}</h3>
                <p className="text-sm opacity-80 line-clamp-2">{item.description}</p>
                
                {item.placeId && (
                  <Link 
                    href={`/map?lat=${item.placeId.location.coordinates[1]}&lng=${item.placeId.location.coordinates[0]}&placeId=${item.placeId._id}`}
                    className="inline-flex items-center gap-2 mt-3 bg-white/20 hover:bg-white/30 transition backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <MapPin className="w-4 h-4" />
                    {item.placeId.name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {loading && (
        <div className="h-20 flex items-center justify-center text-white w-full snap-start">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}


/*


'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import MediaPlayer from './MediaPlayer';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

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
}

export default function RoamFeed() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Intersection Observer to detect which video is currently visible
  const feedObserver = useRef<IntersectionObserver | null>(null);
  const feedCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      // 0.6 means 60% of the video must be visible to trigger 'play'
      if (entry.isIntersecting) {
        setActiveId(entry.target.getAttribute('data-id'));
      }
    });
  }, []);

  useEffect(() => {
    feedObserver.current = new IntersectionObserver(feedCallback, { threshold: 0.6 });
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

  useEffect(() => { fetchMedia(0); }, []);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
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
  }, [loading, hasMore, skip]);

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] overflow-y-scroll snap-y snap-mandatory bg-black">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive = activeId === item._id; // Check if this specific item is in view
        
        return (
          <div 
            key={item._id} 
            data-id={item._id}
            ref={(node) => {
              if (isLast) lastElementRef(node as HTMLDivElement);
              if (node) feedObserver.current?.observe(node);
            }}
            className="relative w-full h-[100dvh] snap-start bg-zinc-900 flex flex-col"
          >
            <div className="flex-1 relative h-full">
              <MediaPlayer 
                {...item}
                isActive={isActive} // Pass the active state to MediaPlayer
              />
            </div>
            
           
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end z-10 pointer-events-none">
              <div className="flex-1 text-white pr-4">
                <h3 className="font-bold text-lg mb-1">{item.title || 'Untitled'}</h3>
                <p className="text-sm opacity-80 line-clamp-2">{item.description}</p>
                
                {item.placeId && (
                  <Link 
                    href={`/map?lat=${item.placeId.location.coordinates[1]}&lng=${item.placeId.location.coordinates[0]}&placeId=${item.placeId._id}`}
                    className="inline-flex items-center gap-2 mt-3 bg-white/20 hover:bg-white/30 transition backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium pointer-events-auto"
                  >
                    <MapPin className="w-4 h-4" />
                    {item.placeId.name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {loading && (
        <div className="h-20 flex items-center justify-center text-white w-full snap-start">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

*/