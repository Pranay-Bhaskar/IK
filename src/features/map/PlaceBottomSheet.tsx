"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  MapPin,
  Navigation,
  Play,
  Share2,
  Bookmark,
  Loader2,
  Film,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IPlace, IVideo } from "@/types";
import { CATEGORY_EMOJI, PLACE_CATEGORIES } from "./constants";

interface PlaceBottomSheetProps {
  place: IPlace | null;
  userCoords: { lat: number; lng: number } | null;
  onClose: () => void;
  onOpenInMaps: (place: IPlace) => void;
  onWatchVideos: (video: IVideo) => void;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function getGoogleMapsUrl(place: IPlace) {
  const [lng, lat] = place.location.coordinates;
  const q = encodeURIComponent(`${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function PlaceBottomSheet({
  place,
  userCoords,
  onClose,
  onOpenInMaps,
  onWatchVideos,
}: PlaceBottomSheetProps) {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);

  useEffect(() => {
    if (!place) {
      setVideos([]);
      setDescExpanded(false);
      return;
    }

    setVideosLoading(true);
    setVideos([]);

    fetch(`/api/places/${place._id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setVideos(Array.isArray(d?.data?.videos) ? d.data.videos : []);
      })
      .catch(() => setVideos([]))
      .finally(() => setVideosLoading(false));
  }, [place?._id]);

  const handleShare = useCallback(async () => {
    if (!place) return;
    const url = `${window.location.origin}/map?placeId=${place._id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: place.name,
          text: `${place.name} — ${place.city || place.district || "Karnataka"}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  }, [place]);

  const handleOpenInMaps = useCallback(() => {
    if (!place) return;
    const url = getGoogleMapsUrl(place);
    window.open(url, "_blank", "noopener,noreferrer");
    onOpenInMaps(place);
  }, [place, onOpenInMaps]);

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = 0;
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) {
      dragCurrentY.current = dy;
      if (sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  };

  const onTouchEnd = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "";
      sheetRef.current.style.transform = "";
    }
    if (dragCurrentY.current > 120) onClose();
    dragStartY.current = null;
    dragCurrentY.current = 0;
  };

  if (!place) return null;

  const [lng, lat] = place.location.coordinates;
  const catConfig = PLACE_CATEGORIES.find((c) => c.value === place.category);
  const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";

  const distanceKm = userCoords
    ? haversineKm(userCoords.lat, userCoords.lng, lat, lng)
    : place.distanceKm ?? null;

  const MAX_DESC = 140;
  const desc = place.description || "";
  const descCropped =
    desc.length > MAX_DESC && !descExpanded ? desc.slice(0, MAX_DESC) + "…" : desc;

  const safeVideos = Array.isArray(videos) ? videos : [];

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/35" onClick={onClose} aria-hidden="true" />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${place.name}`}
        className="absolute bottom-0 left-0 right-0 z-40 rounded-t-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #111827 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          maxHeight: "82dvh",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
          animation: "slideUpSheet 0.3s cubic-bezier(0.32,0.72,0,1) forwards",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 w-8 h-8 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors"
          aria-label="Close place details"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(82dvh - 40px)" }}>
          {place.thumbnailUrl && (
            <div className="w-full aspect-video overflow-hidden">
              <img
                src={place.thumbnailUrl}
                alt={place.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="px-5 pt-4 pb-6 space-y-4">
            <div>
              {catConfig && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mb-2"
                  style={{ background: catConfig.bgColor, color: catConfig.color }}
                >
                  <span>{emoji}</span>
                  <span>{catConfig.label}</span>
                </span>
              )}

              <h2 className="text-xl font-black text-white leading-tight">{place.name}</h2>

              <div className="flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                <span className="text-sm text-white/60">
                  {[place.city, place.district, place.state].filter(Boolean).join(", ")}
                </span>
              </div>

              {distanceKm !== null && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-blue-400">{distanceKm} km away</span>
                </div>
              )}
            </div>

            {desc && (
              <div>
                <p className="text-sm text-white/70 leading-relaxed">{descCropped}</p>
                {desc.length > MAX_DESC && (
                  <button
                    onClick={() => setDescExpanded((e) => !e)}
                    className="text-xs text-white/40 mt-1 font-semibold hover:text-white/60 transition-colors"
                  >
                    {descExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={handleOpenInMaps}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold text-sm py-3 rounded-2xl active:scale-95 transition-all hover:bg-white/90"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Maps
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all active:scale-95"
                aria-label="Share this place"
              >
                <Share2 className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={() => setSaved((s) => !s)}
                className={cn(
                  "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95",
                  saved
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-white/8 border-white/10 text-white/70 hover:bg-white/15"
                )}
                aria-label={saved ? "Unsave place" : "Save place"}
                aria-pressed={saved}
              >
                <Bookmark className={cn("w-4 h-4", saved && "fill-amber-400")} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Film className="w-4 h-4 text-white/50" />
                <span className="text-sm font-bold text-white/80">Videos from this place</span>
                {!videosLoading && safeVideos.length > 0 && (
                  <span className="text-xs text-white/40 font-semibold ml-auto">
                    {safeVideos.length} video{safeVideos.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {videosLoading && (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                  <span className="text-sm text-white/40">Loading videos...</span>
                </div>
              )}

              {!videosLoading && safeVideos.length === 0 && (
                <div className="py-4 text-center">
                  <div className="text-3xl mb-2">🎬</div>
                  <p className="text-sm text-white/40">No videos for this place yet</p>
                </div>
              )}

              {!videosLoading && safeVideos.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                  {safeVideos.map((video) => (
                    <VideoThumb
                      key={video._id}
                      video={video}
                      onClick={() => onWatchVideos(video)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function VideoThumb({ video, onClick }: { video: IVideo; onClick: () => void }) {
  const creator = typeof video.creatorId === "object" ? (video.creatorId as { fullName: string }) : null;

  return (
    <button onClick={onClick} className="flex-shrink-0 w-36 group" aria-label={`Watch video: ${video.title}`}>
      <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-1.5">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          </div>
        </div>
      </div>
      <p className="text-xs text-white/80 font-semibold line-clamp-2 leading-tight">{video.title}</p>
      {creator && <p className="text-[10px] text-white/40 mt-0.5 truncate">{creator.fullName}</p>}
    </button>
  );
}