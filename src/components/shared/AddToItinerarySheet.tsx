"use client";

import { useEffect, useState } from "react";
import { X, Plus, Check, Route, Loader2, ChevronRight } from "lucide-react";
// FIX: Added IPlace to your imports
import { IItinerary, IVideo, IPlace } from "@/types"; 
import { cn, formatDate } from "@/lib/utils";

interface Props {
  video: IVideo;
  place: IPlace; // FIX: We now accept 'place' as a prop!
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function AddToItinerarySheet({ video, place, isOpen, onClose, onSuccess }: Props) {
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/itineraries")
      .then(r => r.json())
      .then(d => { if (d.success) setItineraries(d.data.itineraries); })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const addToItinerary = async (itinId: string) => {
    setAddingTo(itinId);
    try {
      const res = await fetch(`/api/itineraries/${itinId}/places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video._id, 
          // FIX: This now works perfectly because 'place' is passed in!
          placeName: place.name || "Unknown Place", 
          district: place.district || "Unknown District",
          thumbnailUrl: video.thumbnailUrl,
          notes: ""
        }),
      });
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to add");
      }
      
      setAdded(prev => new Set([...prev, itinId]));
      onSuccess(`Added to "${itineraries.find(i => i._id === itinId)?.title}"`);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message); 
    } finally {
      setAddingTo(null);
    }
  };

  const createAndAdd = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const itin = data.data.itinerary;
        setItineraries(prev => [itin, ...prev]);
        setNewTitle("");
        await addToItinerary(itin._id);
      }
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[101] slide-up">
        <div className="bg-black/80 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 max-h-[75dvh] flex flex-col shadow-2xl">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-black text-white">Add to trip</h3>
              {/* FIX: Using place for the header text here too */}
              <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[240px] font-medium">{place.name}, {place.district}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Create new input */}
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex gap-2">
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createAndAdd()}
                placeholder="Create new trip..."
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-zinc-500 focus:border-white transition-all outline-none"
              />
              <button
                onClick={createAndAdd}
                disabled={!newTitle.trim() || creating}
                className="w-10 h-10 rounded-xl bg-white disabled:opacity-40 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              >
                {creating ? <Loader2 className="w-4 h-4 text-black animate-spin" /> : <Plus className="w-4 h-4 text-black" />}
              </button>
            </div>
          </div>

          {/* Existing itineraries */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            {loading ? (
              <> {[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-2xl opacity-50" />)} </>
            ) : itineraries.length === 0 ? (
              <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                <Route className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-400">No trips yet — create your first one above</p>
              </div>
            ) : (
              itineraries.map(itin => {
                const isAdded = added.has(itin._id);
                const isAdding = addingTo === itin._id;
                return (
                  <button
                    key={itin._id}
                    onClick={() => !isAdded && addToItinerary(itin._id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left shadow-lg",
                      isAdded
                        ? "bg-white/10 border-white/20"
                        : "bg-black/40 backdrop-blur-md border-white/10 hover:bg-white/5 active:scale-[0.98]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                      isAdded ? "bg-white border-white" : "bg-white/5 border-white/10"
                    )}>
                      {isAdding
                        ? <Loader2 className="w-4 h-4 text-black animate-spin" />
                        : isAdded
                          ? <Check className="w-4 h-4 text-black" />
                          : <Route className="w-4 h-4 text-zinc-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold truncate", isAdded ? "text-white" : "text-white")}>{itin.title}</p>
                      <p className="text-[11px] font-medium text-zinc-500 mt-0.5">{itin.places?.length || 0} places · {formatDate(itin.updatedAt)}</p>
                    </div>
                    {!isAdded && <ChevronRight className="w-4 h-4 text-zinc-600" />}
                    {isAdded && <span className="text-[10px] text-white font-black uppercase tracking-wider">Added</span>}
                  </button>
                );
              })
            )}
          </div>
          <div className="h-6" />
        </div>
      </div>
    </>
  );
}