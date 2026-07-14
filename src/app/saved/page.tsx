/*
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

interface SavedItem {
  _id: string;
  videoId: {
    _id: string;
    title: string;
    placeName: string;
    district: string;
    thumbnailUrl?: string;
    category: string;
    placeId?: {
      _id: string;
      name?: string;
      city?: string;
      district?: string;
    } | string;
  };
}

export default function SavedPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos/saved")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setSaved(Array.isArray(d?.data?.saved) ? d.data.saved : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getPlaceId = (v: SavedItem["videoId"]) => {
    if (!v?.placeId) return null;
    return typeof v.placeId === "object" ? v.placeId._id : v.placeId;
  };

  return (
    <div className="min-h-dvh bg-transparent pb-24">
      <div className="px-4 pt-14 pb-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <h1 className="text-xl font-black text-white">Saved</h1>
        <p className="text-xs text-white/60 mt-1">Places and videos you have bookmarked</p>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        ) : saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center mb-4">
              <Bookmark className="w-7 h-7 text-white/45" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Nothing saved yet</h2>
            <p className="text-sm text-white/55 max-w-[220px]">
              Tap the bookmark icon on any video or place to save it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((item) => {
              const v = item.videoId;
              if (!v) return null;

              const placeId = getPlaceId(v);

              return (
                <button
                  key={item._id}
                  onClick={() => {
                    if (placeId) router.push(`/place/${placeId}`);
                  }}
                  className="w-full flex items-center gap-3 bg-black/25 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-left active:opacity-70 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/8 border border-white/10 flex-shrink-0">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{v.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-white/45" />
                      <span className="text-xs text-white/50 truncate">
                        {v.placeName}, {v.district}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

*/


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MapPin, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

interface SavedItem {
  _id: string;
  videoId: {
    _id: string;
    title: string;
    placeName: string;
    district: string;
    thumbnailUrl?: string;
    category: string;
    placeId?: {
      _id: string;
      name?: string;
      city?: string;
      district?: string;
    } | string;
  } | null;
}

export default function SavedPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos/saved")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setSaved(Array.isArray(d?.data?.saved) ? d.data.saved : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getPlaceId = (v: SavedItem["videoId"]) => {
    if (!v?.placeId) return null;
    return typeof v.placeId === "object" ? v.placeId._id : v.placeId;
  };

  return (
     <div className="relative min-h-dvh scenery-bg">
      {/* ── Cinematic Overlay ── */}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-20 px-4 pt-14 pb-4 border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 shadow-sm">
        <h1 className="text-2xl font-black text-white drop-shadow-md">Saved</h1>
        <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">Places and videos you bookmarked</p>
      </div>

      <div className="relative z-10 px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-2xl">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] animate-pulse">Loading Collection...</p>
          </div>
        ) : saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-2xl">
              <Bookmark className="w-10 h-10 text-zinc-500" />
            </div>
            <h2 className="text-lg font-black text-white mb-2 drop-shadow-md">Nothing saved yet</h2>
            <p className="text-sm font-medium text-zinc-400 max-w-[250px] leading-relaxed">
              Tap the bookmark icon on any video or place to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((item) => {
              const v = item.videoId;
              
              // DEFENSIVE CHECK: Handle orphaned data if video was deleted from DB
              const isBroken = !v || !v.title;
              const placeId = getPlaceId(v);

              return (
                <button
                  key={item._id}
                  onClick={() => {
                    if (!isBroken && placeId) router.push(`/place/${placeId}`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 bg-black/40 backdrop-blur-md border rounded-2xl p-3 text-left transition-all shadow-lg",
                    isBroken 
                      ? "border-rose-500/20 opacity-70 cursor-not-allowed" 
                      : "border-white/10 hover:bg-white/5 active:scale-[0.98]"
                  )}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                    {v?.thumbnailUrl && !isBroken ? (
                      <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isBroken ? <AlertCircle className="w-5 h-5 text-rose-500/50" /> : <span className="text-xl grayscale">🎬</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-bold truncate drop-shadow-sm",
                      isBroken ? "text-rose-400" : "text-white"
                    )}>
                      {isBroken ? "Content Unavailable" : v.title}
                    </p>
                    {!isBroken && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span className="text-[11px] font-bold text-zinc-400 truncate uppercase tracking-wider">
                          {v.placeName}, {v.district}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isBroken && <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}