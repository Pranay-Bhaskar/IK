'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface MediaPlayerProps {
  type: 'video' | 'image';
  sourceType: 'cloudinary' | 'youtube';
  url: string;
  thumbnailUrl?: string;
  className?: string;
}

export default function MediaPlayer({ type, sourceType, url, thumbnailUrl, className = '' }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (sourceType === 'youtube') {
    if (!isPlaying && thumbnailUrl) {
      return (
        <div 
          className={`relative w-full h-full cursor-pointer flex items-center justify-center bg-black ${className}`}
          onClick={() => setIsPlaying(true)}
        >
          <img src={thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 p-4 rounded-full">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <iframe
        src={`${url}?autoplay=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full h-full ${className}`}
      />
    );
  }

  if (type === 'image') {
    return (
      <img src={url} alt="Media content" className={`w-full h-full object-cover ${className}`} />
    );
  }

  // Cloudinary Video (or direct mp4)
  return (
    <video
      src={url}
      poster={thumbnailUrl}
      controls
      autoPlay={false} // Allow parent to control this if needed, or use intersection observer
      playsInline
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
