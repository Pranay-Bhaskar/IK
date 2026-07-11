
'use client';
/*
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
    // 1. Extract the Video ID
    const getVideoId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
     /* const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getVideoId(url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

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
        // 2. Use the generated embedUrl here
        src={`${embedUrl}?autoplay=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full h-full ${className}`}
      />
    );
  }

  // ... rest of your code (image and Cloudinary video)

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
*/





// import React, { useState, useEffect, useRef } from 'react';
// import { Play } from 'lucide-react';

// interface MediaPlayerProps {
//   type: 'video' | 'image';
//   sourceType: 'cloudinary' | 'youtube';
//   url: string;
//   thumbnailUrl?: string;
//   className?: string;
//   isActive?: boolean; // Tells the player if it is currently in view
// }

// const MediaPlayer = React.memo(({ type, sourceType, url, thumbnailUrl, className = '', isActive = false }: MediaPlayerProps) => {
//   const [showIframe, setShowIframe] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
  
//   // Handle Thumbnail Fallback
//   const [imgSrc, setImgSrc] = useState(thumbnailUrl || '');

//   // Autoplay and Pause logic driven by the Intersection Observer
//   useEffect(() => {
//     if (isActive) {
//       setShowIframe(true); // Load YouTube iframe
//       if (videoRef.current && type === 'video' && sourceType !== 'youtube') {
//         // Play Cloudinary video, catch AbortError silently
//         videoRef.current.play().catch(err => {
//           if (err.name !== 'AbortError') console.error('Video play error:', err);
//         });
//       }
//     } else {
//       setShowIframe(false); // Unload YouTube iframe to stop it
//       if (videoRef.current && type === 'video' && sourceType !== 'youtube') {
//         videoRef.current.pause(); // Pause Cloudinary video
//         videoRef.current.currentTime = 0; // Optional: Reset to start
//       }
//     }
//   }, [isActive, type, sourceType]);

//   if (sourceType === 'youtube') {
//     const getVideoId = (url: string) => {
//       const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//       const match = url.match(regExp);
//       return (match && match[2].length === 11) ? match[2] : null;
//     };

//     const videoId = getVideoId(url);
//     const embedUrl = `https://www.youtube.com/embed/${videoId}`;
//     const fallbackThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

//     // Show thumbnail if not active or not clicked
//     if (!showIframe) {
//       return (
//         <div 
//           className={`relative w-full h-full cursor-pointer flex items-center justify-center bg-black ${className}`}
//           onClick={() => setShowIframe(true)}
//         >
//           <img 
//             src={imgSrc || fallbackThumb} 
//             onError={() => setImgSrc(fallbackThumb)} // Fixes the 404 missing thumbnail error
//             alt="Video thumbnail" 
//             className="w-full h-full object-cover opacity-80" 
//           />
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="bg-black/60 p-4 rounded-full">
//               <Play className="w-8 h-8 text-white ml-1" />
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Mute is highly recommended for autoplay to bypass strict browser policies
//     return (
//       <iframe
//         src={`${embedUrl}?autoplay=1&mute=1&modestbranding=1`} 
//         title="YouTube video player"
//         frameBorder="0"
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//         allowFullScreen
//         className={`w-full h-full ${className}`}
//       />
//     );
//   }

//   if (type === 'image') {
//     return <img src={url} alt="Media content" className={`w-full h-full object-cover ${className}`} />;
//   }

//   // Cloudinary Video (or direct mp4)
//   return (
//     <video
//       ref={videoRef}
//       src={url}
//       poster={thumbnailUrl}
//       controls
//       loop
//       playsInline
//       muted // Required by most mobile browsers to allow programmatic autoplay
//       className={`w-full h-full object-cover ${className}`}
//     />
//   );
// });

// MediaPlayer.displayName = 'MediaPlayer';
// export default MediaPlayer;

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

      let cancelled = false;

      const playVideo = async () => {
        try {
          if (video.readyState >= 2) {
            if (!cancelled) {
              await video.play();
            }
          } else {
            const onLoaded = async () => {
              video.removeEventListener('loadeddata', onLoaded);

              if (cancelled) return;

              try {
                await video.play();
              } catch (err: any) {
                if (err.name !== 'AbortError') {
                  console.error('Video play error:', err);
                }
              }
            };

            video.addEventListener('loadeddata', onLoaded);
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error('Video play error:', err);
          }
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
