"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark, Share2, MapPin, Volume2, VolumeX,
  Play, UserCircle2, Plus, Navigation,
  Footprints, Car, Bike, Bus
} from "lucide-react";
import { IVideo, TRAVEL_MODES } from "@/types";
import { formatCount, formatRelativeTime, cn } from "@/lib/utils";
import { CATEGORIES } from "@/constants";
import { AddToItinerarySheet } from "@/components/shared/AddToItinerarySheet";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

const TRAVEL_ICONS: Record<string, React.ElementType> = {
  walk: Footprints, bike: Bike, car: Car, public: Bus,
};

interface Props {
  video: IVideo;
  isActive: boolean;
  userLocation?: { lat: number; lon: number } | null;
  scrollIndex?: number;
  totalCount?: number;
}

export function VideoCard({ video, isActive, userLocation, scrollIndex = 0, totalCount = 1 }: Props) {
  const router   = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Safely extract Place ID securely regardless of Mongoose population depth
  const pId = video.placeId 
    ? (typeof video.placeId === "object" ? (video.placeId as any)._id || video.placeId : video.placeId) 
    : null;

  const [muted,        setMuted]        = useState(true);
  const [paused,       setPaused]       = useState(false);
  const [flashPlay,    setFlashPlay]    = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [saveCount,    setSaveCount]    = useState(video.savesCount);
  const [liked,        setLiked]        = useState(false);
  const [likeCount,    setLikeCount]    = useState(video.likesCount);
  const [showItinerary,setShowItinerary]= useState(false);
  const [travelMode,   setTravelMode]   = useState(TRAVEL_MODES[2]); // car default
  const [showTravel,   setShowTravel]   = useState(false);
  const { toasts, removeToast, toast }  = useToast();

  const creator = typeof video.creatorId === "object"
    ? video.creatorId as { fullName: string; profileImage?: string; isVerified?: boolean }
    : null;
  const category = CATEGORIES.find(c => c.value === video.category);

  // Calculate Distance
  const distKm = video.distanceKm ?? (() => {
    if (!userLocation || !video.latitude || !video.longitude) return null;
    const R = 6371;
    const dLat = ((video.latitude  - userLocation.lat) * Math.PI) / 180;
    const dLon = ((video.longitude - userLocation.lon) * Math.PI) / 180;
    const a = Math.sin(dLat/2)**2
      + Math.cos(userLocation.lat*Math.PI/180)
      * Math.cos(video.latitude*Math.PI/180)
      * Math.sin(dLon/2)**2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
  })();

  const travelMins = distKm ? Math.round((distKm / travelMode.speedKmh) * 60) : null;
  const fmtTime    = (m: number) => m < 60 ? `${m}m` : `${Math.floor(m/60)}h${m%60 ? ` ${m%60}m` : ""}`;

  // Native Video Autoplay Logic
  useEffect(() => {
    if (video.sourceType === "youtube") return;
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;

    const playVideo = async () => {
      try {
        if (v.readyState >= 2) {
          if (!cancelled) {
            await v.play();
            setPaused(false);
          }
        } else {
          const onLoaded = async () => {
            v.removeEventListener("loadeddata", onLoaded);
            if (cancelled) return;
            try {
              await v.play();
              setPaused(false);
            } catch (err: any) {
              console.error("❌ play() failed", err);
            }
          };
          v.addEventListener("loadeddata", onLoaded);
        }
      } catch (err: any) {
        console.error("❌ playVideo error", err);
      }
    };

    if (isActive) {
      playVideo();
    } else {
      if (!v.paused) {
        v.pause();
      }
    }

    return () => {
      cancelled = true;
    };
  }, [isActive, video.sourceType]);

  // Check if video is saved
  useEffect(() => {
    if (!video._id) return;
    fetch(`/api/videos/save?videoId=${video._id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSaved(d.data.saved); })
      .catch(()=>{});
  }, [video._id]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    
    if (v.paused) {
      v.play().catch(err => {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      });
      setPaused(false);
    } else { 
      v.pause(); 
      setPaused(true); 
    }
    setFlashPlay(true);
    setTimeout(() => setFlashPlay(false), 600);
  }, []);

  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res  = await fetch("/api/videos/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video._id }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.data.saved);
        setSaveCount(c => data.data.saved ? c+1 : c-1);
        toast.success(data.data.saved ? "Saved to your collection!" : "Removed from saved");
      } else if (res.status === 401) {
        toast.error("Sign in to save places"); 
        router.push("/login");
      }
    } catch { 
      toast.error("Failed to save"); 
    }
  }, [video._id, toast, router]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/place/${pId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url });
      } else { 
        await navigator.clipboard.writeText(url); 
        toast.success("Link copied to clipboard!"); 
      }
    } catch {}
  }, [video.title, pId, toast]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = video.youtubeVideoId || (video.url ? getYoutubeId(video.url) : null);

  return (
    <>
      <div className="relative w-full h-dvh bg-black overflow-hidden select-none">

        {/* ── Media ── */}
        {video.sourceType === "youtube" ? (
          isActive ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`}
              title={video.title}
              className="absolute inset-0 w-full h-full pointer-events-none"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img 
              src={video.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`} 
              className="absolute inset-0 w-full h-full object-cover grayscale-[15%]" 
              alt={video.title} 
            />
          )
        ) : (
          <video
            ref={videoRef}
            src={video.url}
            poster={video.thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted={muted}
            playsInline
            preload="metadata"
            onClick={togglePlay}
          />
        )}

        {/* ── Gradient overlays ── */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-black/60" />
        </div>

        {/* ── Play flash ── */}
        {flashPlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              {paused
                ? <Play className="w-9 h-9 text-white fill-white ml-1" />
                : <Play className="w-9 h-9 text-white/0 fill-white/0 ml-1" />
              }
            </div>
          </div>
        )}

        {/* ── TOP BAR: Category badge + Mute ── */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-10 pointer-events-none"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 6.5rem)' }}
        >
          {category && (
            <span className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg pointer-events-auto">
              {category.emoji} {category.label}
            </span>
          )}
          <div className="flex items-center gap-2 pointer-events-auto ml-auto">
            <button
              onClick={e => { e.stopPropagation(); if (videoRef.current) { videoRef.current.muted = !muted; setMuted(m=>!m); }}}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-white/10"
            >
              {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* ── RIGHT SIDE ACTION RAIL ── */}
        <div className="absolute right-3 bottom-36 flex flex-col items-center gap-5 z-10">

          {/* Creator avatar */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 bg-black/40 backdrop-blur-md shadow-xl flex items-center justify-center">
              {creator?.profileImage
                ? <img src={creator.profileImage} alt="" className="w-full h-full object-cover" />
                : creator?.fullName
                  ? <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">{creator.fullName[0]}</div>
                  : <UserCircle2 className="w-full h-full text-zinc-400 p-1" />
              }
            </div>
            {creator?.isVerified && (
              <div className="w-5 h-5 rounded-full bg-white border-2 border-black flex items-center justify-center -mt-2.5 shadow-md">
                <span className="text-[8px] text-black font-black">✓</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <RailBtn
            onClick={handleSave}
            count={saveCount}
            label="Save"
            active={saved}
          >
            <Bookmark className={cn("w-5 h-5", saved ? "text-black fill-black" : "text-white")} />
          </RailBtn>

          {/* Add to trip Button */}
          <RailBtn
            onClick={e => { e.stopPropagation(); setShowItinerary(true); }}
            label="Trip"
          >
            <Plus className="w-6 h-6 text-white" />
          </RailBtn>

          {/* Open on Map Button */}
          <RailBtn
            onClick={e => {
              e.stopPropagation();
              // FIX: Send coordinates FIRST so the internal map instantly knows where to zoom
              if (video.latitude && video.longitude) {
                router.push(`/map?lat=${video.latitude}&lng=${video.longitude}&placeId=${pId || ""}`);
              } else if (pId) {
                router.push(`/map?placeId=${pId}`);
              } else {
                router.push(`/map`);
              }
            }}
            label="Map"
          >
            <MapPin className="w-5 h-5 text-white" />
          </RailBtn>

          {/* Share Button */}
          <RailBtn onClick={handleShare} label="Share">
            <Share2 className="w-5 h-5 text-white" />
          </RailBtn>
        </div>

        {/* ── SCROLL DOTS ── */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {Array.from({ length: Math.min(totalCount, 5) }).map((_, i) => (
            <div key={i} className={cn(
              "rounded-full transition-all duration-300",
              i === scrollIndex % 5
                ? "w-[4px] h-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : "w-[4px] h-[4px] bg-white/20"
            )} />
          ))}
        </div>

        {/* ── BOTTOM INFO ── */}
        <div className="absolute bottom-0 left-0 right-14 px-4 pb-24 z-10">

          {/* Creator row */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-white font-black text-sm drop-shadow-md">
              @{creator?.fullName?.replace(/\s+/g,"").toLowerCase() || "creator"}
            </span>
            {creator?.isVerified && (
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-[8px] text-black font-black">✓</span>
              </div>
            )}
            <button className="ml-auto border border-white/20 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white active:scale-95 transition-all shadow-sm hover:bg-white/20">
              + Follow
            </button>
          </div>

          {/* Title */}
          <h2 className="text-white font-black text-lg leading-snug mb-3 drop-shadow-md line-clamp-2">
            {video.title}
          </h2>

          {/* Weather + distance badge row */}
          <div className="flex items-center gap-2 mb-4">
            {distKm !== null && (
              <button
                onClick={e => { e.stopPropagation(); setShowTravel(t=>!t); }}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Navigation className="w-3 h-3 text-white" />
                <span className="text-[11px] text-white font-bold">{distKm} km away</span>
                {travelMins && (
                  <>
                    <span className="text-white/20">|</span>
                    <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">{travelMode.icon} {fmtTime(travelMins)}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Travel mode picker */}
          {showTravel && distKm !== null && (
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 grid grid-cols-4 gap-2 mb-4 shadow-xl fade-up">
              {TRAVEL_MODES.map(mode => {
                const ModeIcon = TRAVEL_ICONS[mode.mode] || Car;
                const mins     = Math.round((distKm / mode.speedKmh) * 60);
                const isOn     = travelMode.mode === mode.mode;
                return (
                  <button
                    key={mode.mode}
                    onClick={e => { e.stopPropagation(); setTravelMode(mode); setShowTravel(false); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all",
                      isOn ? "bg-white text-black shadow-md scale-[1.02]" : "bg-white/5 border border-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    <ModeIcon className={cn("w-4 h-4", isOn ? "text-black" : "text-zinc-300")} />
                    <span className="text-[9px] font-black uppercase tracking-wider">{mode.label}</span>
                    <span className={cn("text-[9px] font-bold", isOn ? "text-zinc-700" : "text-zinc-500")}>{fmtTime(mins)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* CTA row */}
          <div className="flex gap-2.5">
            <button
              onClick={e => { e.stopPropagation(); setShowItinerary(true); }}
              className="flex-1 bg-white text-black text-xs font-black uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add to trip
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                // FIX: Send coordinates FIRST so the internal map instantly knows where to zoom
                if (video.latitude && video.longitude) {
                  router.push(`/map?lat=${video.latitude}&lng=${video.longitude}&placeId=${pId || ""}`);
                } else if (pId) {
                  router.push(`/map?placeId=${pId}`);
                } else {
                  router.push(`/map`);
                }
              }}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg hover:bg-white/20"
            >
              <MapPin className="w-4 h-4 text-white" />
              View on Map
            </button>
          </div>

          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-4 mb-2 drop-shadow-sm">
            {formatRelativeTime(video.createdAt)}
          </p>
        </div>
      </div>

      {/* Add to itinerary bottom sheet */}
      <AddToItinerarySheet
        video={video}
        isOpen={showItinerary}
        onClose={() => setShowItinerary(false)}
        onSuccess={msg => toast.success(msg)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function RailBtn({
  children, count, label, onClick, active = false,
}: {
  children: React.ReactNode;
  count?: number;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <div className={cn(
        "w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-lg",
        active ? "bg-white border-white" : "bg-black/40 backdrop-blur-md border-white/10 hover:bg-white/10"
      )}>
        {children}
      </div>
      {count !== undefined && (
        <span className="text-white text-xs font-black drop-shadow-md">{formatCount(count)}</span>
      )}
      <span className="text-zinc-300 text-[9px] font-bold uppercase tracking-wider drop-shadow-md">{label}</span>
    </button>
  );
}