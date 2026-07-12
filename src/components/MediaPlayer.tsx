'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

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
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [showIframe, setShowIframe] = useState(false);
    const [imgSrc, setImgSrc] = useState(thumbnailUrl || '');

    // Presentational-only control state — does not drive autoplay.
    const [muted, setMuted] = useState(true);
    const [paused, setPaused] = useState(true);
    const [ytMuted, setYtMuted] = useState(true);

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
        setYtMuted(true); // reset control UI state when the slide goes inactive
      }
    }, [isActive, sourceType]);

    // Keep the custom play/pause icon in sync with real video state,
    // without altering when/why the video actually plays or pauses.
    useEffect(() => {
      const video = videoRef.current;
      if (!video || type !== 'video' || sourceType === 'youtube') return;

      const onPlay = () => setPaused(false);
      const onPause = () => setPaused(true);

      video.addEventListener('play', onPlay);
      video.addEventListener('pause', onPause);

      return () => {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
      };
    }, [type, sourceType]);

    const toggleVideoPlayback = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const toggleVideoMute = () => {
      setMuted(prev => {
        const next = !prev;
        if (videoRef.current) videoRef.current.muted = next;
        return next;
      });
    };

    const toggleYoutubeMute = () => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      const next = !ytMuted;
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: next ? 'mute' : 'unMute', args: [] }),
        '*'
      );
      setYtMuted(next);
    };

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

      // enablejsapi=1 lets the custom mute button below talk to the player
      // via postMessage — autoplay/mute defaults on load are unchanged.
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;

      if (!showIframe) {
        return (
          <div
            className={`relative w-full h-full cursor-pointer flex items-center justify-center bg-black overflow-hidden ${className}`}
            onClick={() => setShowIframe(true)}
          >
            <img
              src={imgSrc || fallbackThumb}
              onError={() => setImgSrc(fallbackThumb)}
              alt="Video thumbnail"
              className="w-full h-full object-cover opacity-80 transition-transform duration-700 ease-out scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/40 transition-transform duration-300 hover:scale-110 active:scale-95">
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={`relative w-full h-full ${className}`}>
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title="YouTube player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full pointer-events-none"
          />

          <button
            type="button"
            onClick={toggleYoutubeMute}
            aria-label={ytMuted ? 'Unmute' : 'Mute'}
            className="absolute right-4 top-28 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20 active:scale-90"
          >
            {ytMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      );
    }

    // -----------------------------
    // CLOUDINARY / MP4
    // -----------------------------
    return (
      <div className={`relative w-full h-full ${className}`}>
        <video
          ref={videoRef}
          src={url}
          poster={thumbnailUrl}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          onClick={toggleVideoPlayback}
          className="w-full h-full object-cover"
        />

        {/* Beautiful play button — fades in only while paused */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            paused ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={toggleVideoPlayback}
            aria-label="Play"
            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/40 transition-transform duration-300 hover:scale-110 active:scale-95"
          >
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </button>
        </div>

        {/* Elegant mute button */}
        <button
          type="button"
          onClick={toggleVideoMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute right-4 top-28 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20 active:scale-90"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

MediaPlayer.displayName = 'MediaPlayer';

export default MediaPlayer;
