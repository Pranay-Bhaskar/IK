"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { IItinerary } from "@/types";
import { useAuth } from "@/features/auth/AuthContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { ItineraryCard } from "@/features/itineraries/ItineraryCard";
import { CreateItineraryModal } from "@/features/itineraries/CreateItineraryModal";
import { EmptyState } from "@/features/itineraries/EmptyState";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type Tab = "trips" | "saved";

interface SavedItem {
  _id: string;
  videoId: {
    _id: string; title: string; placeName: string;
    district: string; thumbnailUrl?: string;
  } | null; // Note: Can be null if the video was deleted!
}

export default function ItinerariesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<Tab>("trips");
  const [showCreate, setShowCreate]   = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const { toasts, removeToast, toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/itineraries");
      const data = await res.json();
      if (data.success) setItineraries(data.data.itineraries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchItineraries();
  }, [user, fetchItineraries]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleCreate = async (title: string, description: string) => {
    const res  = await fetch("/api/itineraries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (data.success) {
      setItineraries(prev => [data.data.itinerary, ...prev]);
      setShowCreate(false);
      toast.success("Trip created!");
    } else {
      toast.error(data.error || "Failed to create");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/itineraries/${id}`, { method: "DELETE" });
      setItineraries(prev => prev.filter(i => i._id !== id));
      toast.success("Trip deleted");
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = async (itin: IItinerary) => {
    try {
      const res  = await fetch(`/api/itineraries/${itin._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isShared: !itin.isShared }),
      });
      const data = await res.json();
      if (data.success) {
        setItineraries(prev => prev.map(i => i._id === itin._id ? data.data.itinerary : i));
        if (data.data.itinerary.isShared) {
          const url = `${window.location.origin}/itineraries/${itin._id}`;
          if (navigator.share) {
            await navigator.share({ title: itin.title, url });
          } else {
            await navigator.clipboard.writeText(url);
            toast.success("Share link copied!");
          }
        } else {
          toast.info("Trip is now private");
        }
      }
    } catch {
      toast.error("Failed to share");
    }
  };

  if (authLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-transparent flex flex-col relative">
    {/*</div><div className="relative min-h-dvh pb-28">*/}
      {/* ── Fixed Cinematic Overlay ── */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95 z-0 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 px-4 pt-14 pb-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black text-white drop-shadow-md">My Trips</h1>
            <p className="text-xs text-zinc-400 mt-0.5 drop-shadow-sm">Plan your Karnataka journey</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-xl active:scale-[0.95] transition-transform"
          >
            <Plus className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Tabs - Glassmorphic */}
        <div className="flex bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-1 mt-4 shadow-lg">
          {(["trips", "saved"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                activeTab === tab
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {tab === "trips" ? `Trips (${itineraries.length})` : "Saved places"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 px-4 pt-2">
        {/* Trips tab */}
        {activeTab === "trips" && (
          <>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 skeleton rounded-2xl opacity-50" />
                ))}
              </div>
            ) : itineraries.length === 0 ? (
              <EmptyState tab="trips" onCreate={() => setShowCreate(true)} />
            ) : (
              <div className="space-y-3">
                {itineraries.map(itin => (
                  <ItineraryCard
                    key={itin._id}
                    itin={itin}
                    onOpen={() => router.push(`/itineraries/${itin._id}`)}
                    onShare={() => handleShare(itin)}
                    onDelete={() => handleDelete(itin._id, itin.title)}
                    deleting={deletingId === itin._id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Saved tab */}
        {activeTab === "saved" && <SavedPlacesTab />}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateItineraryModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <BottomNav />
    </div>
  );
}

// ── Saved Places sub-tab ──────────────────────────────────────────────
function SavedPlacesTab() {
  const router = useRouter();
  const [saved, setSaved]   = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos/saved")
      .then(r => r.json())
      .then(d => { if (d.success) setSaved(d.data.saved); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 skeleton rounded-2xl opacity-50" />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return <EmptyState tab="saved" />;
  }

  return (
    <div className="space-y-3">
      {saved.map(item => {
        const v = item.videoId;
        
        // ── FIX: Defensive Check for orphaned data ──
        const isBroken = !v || !v.title;

        return (
          <button
            key={item._id}
            // Prevent routing if data is broken
            onClick={() => !isBroken && router.push(`/explore?videoId=${v._id}`)}
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
                  {isBroken ? <AlertCircle className="w-5 h-5 text-rose-500/50" /> : <span className="text-xl">🎬</span>}
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
                  <span className="text-xs text-zinc-400 truncate">
                    {v.placeName}, {v.district}
                  </span>
                </div>
              )}
            </div>
            
            {!isBroken && <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}