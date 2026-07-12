
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface MediaPlayerProps {
  type: 'video' | 'image';
  sourceType: 'cloudinary' | 'youtube';
  url: string;
  thumbnailUrl?: string;
  className?: string;
  isActive?: boolean;
}

const MediaPlayer = React.memo(
  ({
    type,
    sourceType,
    url,
    thumbnailUrl,
    className = '',
    isActive = false,
  }: MediaPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [showIframe, setShowIframe] = useState(false);
    const [imgSrc, setImgSrc] = useState(thumbnailUrl || '');

    // Handle Cloudinary/MP4 autoplay
    useEffect(() => {
      if (type !== 'video' || sourceType === 'youtube') return;

      const video = videoRef.current;
      if (!video) return;

      console.log("================================");
      console.log("URL:", url);
      console.log("Active:", isActive);
      console.log("readyState:", video.readyState);
      console.log("networkState:", video.networkState);
      console.log("paused:", video.paused);
      console.log("================================");

      console.log("MediaPlayer Effect", {
  url,
  isActive,
  readyState: video.readyState,
  paused: video.paused,
});

      let cancelled = false;

      const playVideo = async () => {
  try {
    console.log("▶ Calling play()", {
      url,
      isActive,
      readyState: video.readyState,
      networkState: video.networkState,
      paused: video.paused,
    });

    if (video.readyState >= 2) {
      if (!cancelled) {
        await video.play();
        console.log("✅ play() resolved");
      }
    } else {
      console.log("⏳ Waiting for loadeddata...");

      const onLoaded = async () => {
        console.log("✅ loadeddata fired");

        video.removeEventListener("loadeddata", onLoaded);

        if (cancelled) return;

        try {
          await video.play();
          console.log("✅ play() after loadeddata");
        } catch (err) {
          console.error("❌ play() failed", err);
        }
      };

      video.addEventListener("loadeddata", onLoaded);
    }
  } catch (err) {
    console.error("❌ playVideo error", err);
  }
};

      if (isActive) {
        playVideo();
      } else {
        video.pause();
        video.currentTime = 0;
      }

      return () => {
        cancelled = true;
        video.pause();
      };
    }, [isActive, type, sourceType]);

    // Handle YouTube autoplay
    useEffect(() => {
      if (sourceType !== 'youtube') return;

      if (isActive) {
        setShowIframe(true);
      } else {
        setShowIframe(false);
      }
    }, [isActive, sourceType]);

    // -----------------------------
    // IMAGE
    // -----------------------------
    if (type === 'image') {
      return (
        <img
          src={url}
          alt="Media"
          className={`w-full h-full object-cover ${className}`}
        />
      );
    }

    // -----------------------------
    // YOUTUBE
    // -----------------------------
    if (sourceType === 'youtube') {
      const getVideoId = (url: string) => {
        const regExp =
          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return match && match[2].length === 11 ? match[2] : null;
      };

      const videoId = getVideoId(url);

      if (!videoId) {
        return (
          <div className="flex items-center justify-center w-full h-full bg-black text-white">
            Invalid YouTube URL
          </div>
        );
      }

      const fallbackThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;

      if (!showIframe) {
        return (
          <div
            className={`relative w-full h-full cursor-pointer flex items-center justify-center bg-black ${className}`}
            onClick={() => setShowIframe(true)}
          >
            <img
              src={imgSrc || fallbackThumb}
              onError={() => setImgSrc(fallbackThumb)}
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-80"
            />

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
          src={embedUrl}
          title="YouTube player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={`w-full h-full ${className}`}
        />
      );
    }

    // -----------------------------
    // CLOUDINARY / MP4
    // -----------------------------
    return (
      <video
        ref={videoRef}
        src={url}
        poster={thumbnailUrl}
        controls
        loop
        muted
        playsInline
        preload="metadata"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
);

MediaPlayer.displayName = 'MediaPlayer';

export default MediaPlayer;
