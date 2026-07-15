/*"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, MapPin, Filter, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { IVideo, IPlace } from "@/types";
import { CATEGORIES, KARNATAKA_DISTRICTS } from "@/constants";
import { CATEGORY_EMOJI, PLACE_CATEGORIES } from "@/features/map/constants";
import { cn, formatRelativeTime } from "@/lib/utils";
import { BottomNav } from "@/components/layout/BottomNav";

type SearchTab = "videos" | "places";

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>("videos");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      if (activeTab === "videos") {
        const params = new URLSearchParams({ limit: "30" });
        if (category) params.set("category", category);
        if (district) params.set("district", district);
        const res = await fetch(`/api/videos?${params}`);
        const data = await res.json();
        if (data.success) {
          let results: IVideo[] = data.data.videos;
          if (query.trim()) {
            const q = query.toLowerCase();
            results = results.filter(v =>
              v.title.toLowerCase().includes(q) ||
              (v.placeName || "").toLowerCase().includes(q) ||
              (v.description || "").toLowerCase().includes(q) ||
              v.tags?.some(t => t.toLowerCase().includes(q))
            );
          }
          setVideos(results);
        }
      } else {
        const params = new URLSearchParams({ limit: "30" });
        if (category) params.set("category", category);
        if (district) params.set("district", district);
        if (query.trim()) params.set("q", query.trim());
        const res = await fetch(`/api/places?${params}`);
        const data = await res.json();
        if (data.success) {
          setPlaces(data.data.places);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [query, category, district, activeTab]);

  useEffect(() => {
    if (category || district) doSearch();
  }, [category, district, doSearch]);

  const clearAll = () => { setQuery(""); setCategory(""); setDistrict(""); setVideos([]); setPlaces([]); setSearched(false); };

  const currentCategories = activeTab === "videos" ? CATEGORIES : PLACE_CATEGORIES;
  const resultsCount = activeTab === "videos" ? videos.length : places.length;

  return (
    <div className="min-h-dvh bg-black pb-24">
      {/* Header *}
      <div className="px-4 pt-14 pb-3 bg-black sticky top-0 z-10 border-b border-zinc-900">
        <h1 className="text-xl font-black text-white mb-3">Search</h1>
        
        {/* Tabs *}
        <div className="flex gap-4 mb-4 border-b border-zinc-900">
          <button 
            onClick={() => { setActiveTab("videos"); clearAll(); }}
            className={cn("pb-2 text-sm font-bold border-b-2 transition-all", activeTab === "videos" ? "border-white text-white" : "border-transparent text-zinc-500")}
          >Videos</button>
          <button 
            onClick={() => { setActiveTab("places"); clearAll(); }}
            className={cn("pb-2 text-sm font-bold border-b-2 transition-all", activeTab === "places" ? "border-white text-white" : "border-transparent text-zinc-500")}
          >Places</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={activeTab === "videos" ? "Stories, food, etc..." : "Places, cities, etc..."}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 transition-all"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(s => !s)}
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center transition-all",
              showFilters || category || district
                ? "bg-white/10 border-white text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </form>

        {showFilters && (
          <div className="mt-3 space-y-3 fade-up">
            <div>
              <p className="text-[10px] font-black text-zinc-500 tracking-wider mb-2">CATEGORY</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                <button
                  onClick={() => setCategory("")}
                  className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    !category ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                  )}
                >✨ All</button>
                {currentCategories.map(c => (
                  <button key={c.value}
                    onClick={() => setCategory(category === c.value ? "" : c.value)}
                    className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      category === c.value ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    )}
                  >{c.emoji} {c.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 tracking-wider mb-2">DISTRICT</p>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-zinc-500 transition-all"
              >
                <option value="">All districts</option>
                {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {(category || district || query) && (
              <button onClick={clearAll} className="text-xs text-white font-semibold">Clear all filters</button>
            )}
          </div>
        )}
      </div>

      {/* Body *}
      <div className="px-4 pt-4">
        {!searched && !loading && (
          <div>
            <p className="text-xs font-black text-zinc-500 tracking-wider mb-3">BROWSE BY CATEGORY</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {currentCategories.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setCategory(c.value); doSearch(); }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-600 active:scale-[0.97] transition-all"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <p className="text-xs font-bold text-white mt-2">{c.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Explore →</p>
                </button>
              ))}
            </div>
            <p className="text-xs font-black text-zinc-500 tracking-wider mb-3">POPULAR DISTRICTS</p>
            <div className="flex flex-wrap gap-2">
              {["Kodagu","Chikkamagaluru","Mysuru","Hassan","Uttara Kannada","Dakshina Kannada","Shivamogga"].map(d => (
                <button
                  key={d}
                  onClick={() => { setDistrict(d); doSearch(); }}
                  className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 transition-all"
                >
                  <MapPin className="w-3 h-3" />{d}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
          </div>
        )}

        {searched && !loading && resultsCount === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-bold text-white">No results found</p>
            <p className="text-xs text-zinc-500 mt-1">Try different keywords or filters</p>
          </div>
        )}

        {resultsCount > 0 && (
          <>
            <p className="text-xs text-zinc-500 font-semibold mb-3">{resultsCount} result{resultsCount !== 1 ? "s" : ""}</p>
            <div className="space-y-3">
              {activeTab === "videos" 
                ? videos.map(video => <SearchCard key={video._id} video={video} onClick={() => router.push(`/place/${video._id}`)} />)
                : places.map(place => <SearchPlaceCard key={place._id} place={place} onClick={() => router.push(`/map?placeId=${place._id}`)} />)
              }
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function SearchCard({ video, onClick }: { video: IVideo; onClick: () => void }) {
  const cat = CATEGORIES.find(c => c.value === video.category);
  const creator = typeof video.creatorId === "object" ? video.creatorId as { fullName: string } : null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-left active:opacity-70 transition-all hover:border-zinc-700"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
        {video.thumbnailUrl
          ? <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">{cat?.emoji || "🎬"}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{video.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] text-zinc-500 truncate">{video.placeName}, {video.district}</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-zinc-500">{creator?.fullName}</span>
          <span className="text-[10px] text-zinc-500">{formatRelativeTime(video.createdAt)}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
    </button>
  );
}

function SearchPlaceCard({ place, onClick }: { place: IPlace; onClick: () => void }) {
  const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-left active:opacity-70 transition-all hover:border-zinc-700"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 relative">
        {place.thumbnailUrl
          ? <img src={place.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl bg-black/40">{emoji}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{place.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] text-zinc-500 truncate">{[place.city, place.district].filter(Boolean).join(", ")}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
    </button>
  );
}
*/

/*

"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, MapPin, Filter, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { IVideo, IPlace } from "@/types";
import { CATEGORIES, KARNATAKA_DISTRICTS } from "@/constants";
import { CATEGORY_EMOJI, PLACE_CATEGORIES } from "@/features/map/constants";
import { cn, formatRelativeTime } from "@/lib/utils";
import { BottomNav } from "@/components/layout/BottomNav";

type SearchTab = "videos" | "places";

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>("videos");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      if (activeTab === "videos") {
        const params = new URLSearchParams({ limit: "30" });
        if (category) params.set("category", category);
        if (district) params.set("district", district);
        if (query.trim()) params.set("q", query.trim());

        const res = await fetch(`/api/videos?${params}`);
        const data = await res.json();
        if (data.success) {
          const results: IVideo[] = data.data.videos || [];
          setVideos(results);
        }
      } else {
        const params = new URLSearchParams({ limit: "30" });
        if (category) params.set("category", category);
        if (district) params.set("district", district);
        if (query.trim()) params.set("q", query.trim());

        const res = await fetch(`/api/places?${params}`);
        const data = await res.json();
        if (data.success) {
          setPlaces(data.data.places || []);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [query, category, district, activeTab]);

  useEffect(() => {
    if (category || district) doSearch();
  }, [category, district, doSearch]);

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setDistrict("");
    setVideos([]);
    setPlaces([]);
    setSearched(false);
  };

  const currentCategories = activeTab === "videos" ? CATEGORIES : PLACE_CATEGORIES;
  const resultsCount = activeTab === "videos" ? videos.length : places.length;

  return (
    <div className="min-h-dvh bg-black pb-24">
      <div className="px-4 pt-14 pb-3 bg-black sticky top-0 z-10 border-b border-zinc-900">
        <h1 className="text-xl font-black text-white mb-3">Search</h1>

        <div className="flex gap-4 mb-4 border-b border-zinc-900">
          <button
            onClick={() => { setActiveTab("videos"); clearAll(); }}
            className={cn("pb-2 text-sm font-bold border-b-2 transition-all", activeTab === "videos" ? "border-white text-white" : "border-transparent text-zinc-500")}
          >Videos</button>
          <button
            onClick={() => { setActiveTab("places"); clearAll(); }}
            className={cn("pb-2 text-sm font-bold border-b-2 transition-all", activeTab === "places" ? "border-white text-white" : "border-transparent text-zinc-500")}
          >Places</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={activeTab === "videos" ? "Stories, food, etc..." : "Places, cities, etc..."}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 transition-all"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(s => !s)}
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center transition-all",
              showFilters || category || district
                ? "bg-white/10 border-white text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </form>

        {showFilters && (
          <div className="mt-3 space-y-3 fade-up">
            <div>
              <p className="text-[10px] font-black text-zinc-500 tracking-wider mb-2">CATEGORY</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                <button
                  onClick={() => setCategory("")}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    !category ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                  )}
                >✨ All</button>
                {currentCategories.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(category === c.value ? "" : c.value)}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      category === c.value ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    )}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 tracking-wider mb-2">DISTRICT</p>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-zinc-500 transition-all"
              >
                <option value="">All districts</option>
                {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {(category || district || query) && (
              <button onClick={clearAll} className="text-xs text-white font-semibold">Clear all filters</button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {!searched && !loading && (
          <div>
            <p className="text-xs font-black text-zinc-500 tracking-wider mb-3">BROWSE BY CATEGORY</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {currentCategories.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setCategory(c.value); doSearch(); }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-600 active:scale-[0.97] transition-all"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <p className="text-xs font-bold text-white mt-2">{c.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Explore →</p>
                </button>
              ))}
            </div>
            <p className="text-xs font-black text-zinc-500 tracking-wider mb-3">POPULAR DISTRICTS</p>
            <div className="flex flex-wrap gap-2">
              {["Kodagu","Chikkamagaluru","Mysuru","Hassan","Uttara Kannada","Dakshina Kannada","Shivamogga"].map(d => (
                <button
                  key={d}
                  onClick={() => { setDistrict(d); doSearch(); }}
                  className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 transition-all"
                >
                  <MapPin className="w-3 h-3" />{d}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
          </div>
        )}

        {searched && !loading && resultsCount === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-bold text-white">No results found</p>
            <p className="text-xs text-zinc-500 mt-1">Try different keywords or filters</p>
          </div>
        )}

        {resultsCount > 0 && (
          <>
            <p className="text-xs text-zinc-500 font-semibold mb-3">{resultsCount} result{resultsCount !== 1 ? "s" : ""}</p>
            <div className="space-y-3">
              {activeTab === "videos"
                ? videos.map(video => <SearchCard key={video._id} video={video} onClick={() => router.push(`/place/${video.placeId && typeof video.placeId === "object" ? video.placeId._id : video.placeId}`)} />)
                : places.map(place => <SearchPlaceCard key={place._id} place={place} onClick={() => router.push(`/map?placeId=${place._id}`)} />)
              }
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function SearchCard({ video, onClick }: { video: IVideo; onClick: () => void }) {
  const cat = CATEGORIES.find(c => c.value === video.category);
  const creator = typeof video.creatorId === "object" ? video.creatorId as { fullName: string } : null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-left active:opacity-70 transition-all hover:border-zinc-700"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
        {video.thumbnailUrl
          ? <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">{cat?.emoji || "🎬"}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{video.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] text-zinc-500 truncate">{video.placeName || ""}, {video.district || ""}</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-zinc-500">{creator?.fullName || ""}</span>
          <span className="text-[10px] text-zinc-500">{formatRelativeTime(video.createdAt)}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
    </button>
  );
}

function SearchPlaceCard({ place, onClick }: { place: IPlace; onClick: () => void }) {
  const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-left active:opacity-70 transition-all hover:border-zinc-700"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 relative">
        {place.thumbnailUrl
          ? <img src={place.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl bg-black/40">{emoji}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{place.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] text-zinc-500 truncate">{[place.city, place.district].filter(Boolean).join(", ")}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
    </button>
  );
}

*/


"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, MapPin, Filter, ChevronRight, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { IVideo, IPlace } from "@/types";
import { CATEGORIES, KARNATAKA_DISTRICTS } from "@/constants";
import { CATEGORY_EMOJI, PLACE_CATEGORIES } from "@/features/map/constants";
import { cn, formatRelativeTime } from "@/lib/utils";
import { BottomNav } from "@/components/layout/BottomNav";

type SearchTab = "videos" | "places";

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>("videos");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      if (activeTab === "videos") {
        const params = new URLSearchParams({ limit: "30" });
        if (category) params.set("category", category);
        if (district) params.set("district", district);
        if (query.trim()) params.set("q", query.trim());

        const res = await fetch(`/api/videos?${params}`);
        const data = await res.json();
        if (data.success) {
          const results: IVideo[] = data.data.videos || [];
          setVideos(results);
        }
      } else {
        const params = new URLSearchParams({ limit: "30" });
        if (category) params.set("category", category);
        if (district) params.set("district", district);
        if (query.trim()) params.set("q", query.trim());

        const res = await fetch(`/api/places?${params}`);
        const data = await res.json();
        if (data.success) {
          setPlaces(data.data.places || []);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [query, category, district, activeTab]);

  useEffect(() => {
    if (category || district) doSearch();
  }, [category, district, doSearch]);

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setDistrict("");
    setVideos([]);
    setPlaces([]);
    setSearched(false);
  };

  const currentCategories = activeTab === "videos" ? CATEGORIES : PLACE_CATEGORIES;
  const resultsCount = activeTab === "videos" ? videos.length : places.length;

  return (
    <div className="relative min-h-dvh scenery-bg">
      {/* ── Cinematic Overlay ── 
      <div className="relative inset-0 bg-black/50 z-0 pointer-events-none" />*/}
      {/* ── Cinematic Dark Background Overlay ── */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95 z-0 pointer-events-none" />

      {/* ── Sticky Header ── */}
      <div className="relative z-20 px-4 pt-14 pb-3 bg-black/60 backdrop-blur-xl sticky top-0 border-b border-white/10 shadow-sm">
        <h1 className="text-2xl font-black text-white mb-4 drop-shadow-md">Search</h1>

        <div className="flex gap-6 mb-4 border-b border-white/10">
          <button
            onClick={() => { setActiveTab("videos"); clearAll(); }}
            className={cn("pb-3 text-sm font-black uppercase tracking-wider transition-all", activeTab === "videos" ? "border-b-2 border-white text-white" : "border-b-2 border-transparent text-zinc-500")}
          >Videos</button>
          <button
            onClick={() => { setActiveTab("places"); clearAll(); }}
            className={cn("pb-3 text-sm font-black uppercase tracking-wider transition-all", activeTab === "places" ? "border-b-2 border-white text-white" : "border-b-2 border-transparent text-zinc-500")}
          >Places</button>
        </div>

        <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={activeTab === "videos" ? "Stories, food, etc..." : "Places, cities, etc..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-sm font-bold text-white placeholder-zinc-500 focus:border-white focus:bg-white/10 transition-all outline-none shadow-inner"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-white/10 rounded-full p-1 hover:bg-white/20 transition-colors">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(s => !s)}
            className={cn(
              "w-[52px] h-[52px] rounded-xl border flex items-center justify-center transition-all shadow-md active:scale-95",
              showFilters || category || district
                ? "bg-white border-white text-black"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </form>

        {showFilters && (
          <div className="mt-4 space-y-4 fade-up pb-2">
            <div>
              <p className="text-[10px] font-black text-zinc-500 tracking-[0.15em] mb-2.5">CATEGORY</p>
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                <button
                  onClick={() => setCategory("")}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all",
                    !category ? "bg-white text-black border-white shadow-md" : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                  )}
                >✨ All</button>
                {currentCategories.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(category === c.value ? "" : c.value)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all",
                      category === c.value ? "bg-white text-black border-white shadow-md" : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 tracking-[0.15em] mb-2.5">DISTRICT</p>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-white transition-all outline-none shadow-inner"
              >
                <option value="" className="bg-zinc-900">All districts</option>
                {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d} className="bg-zinc-900">{d}</option>)}
              </select>
            </div>
            {(category || district || query) && (
              <button onClick={clearAll} className="text-[10px] uppercase tracking-wider text-white font-black hover:text-rose-400 transition-colors pt-1">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-4 pt-4">
        {!searched && !loading && (
          <div>
            <p className="text-[10px] font-black text-zinc-500 tracking-[0.2em] mb-3">BROWSE BY CATEGORY</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {currentCategories.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setCategory(c.value); doSearch(); }}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left hover:bg-white/5 active:scale-[0.98] transition-all shadow-lg"
                >
                  <span className="text-2xl drop-shadow-sm grayscale-[20%]">{c.emoji}</span>
                  <p className="text-sm font-black text-white mt-3">{c.label}</p>
                  <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">Explore →</p>
                </button>
              ))}
            </div>
            
            <p className="text-[10px] font-black text-zinc-500 tracking-[0.2em] mb-3">POPULAR DISTRICTS</p>
            <div className="flex flex-wrap gap-2">
              {["Kodagu","Chikkamagaluru","Mysuru","Hassan","Uttara Kannada","Dakshina Kannada","Shivamogga"].map(d => (
                <button
                  key={d}
                  onClick={() => { setDistrict(d); doSearch(); }}
                  className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-2 text-[11px] font-bold text-zinc-300 hover:bg-white/10 transition-all shadow-sm"
                >
                  <MapPin className="w-3 h-3 text-zinc-400" />{d}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-24 skeleton rounded-2xl bg-white/5" />)}
          </div>
        )}

        {searched && !loading && resultsCount === 0 && (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 backdrop-blur-md shadow-xl">
              <Search className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-lg font-black text-white mb-1 drop-shadow-md">No results found</p>
            <p className="text-xs font-medium text-zinc-400">Try different keywords or filters</p>
          </div>
        )}

        {resultsCount > 0 && (
          <>
            <p className="text-[10px] text-zinc-400 font-black tracking-[0.2em] mb-4">
              {resultsCount} RESULT{resultsCount !== 1 ? "S" : ""} FOUND
            </p>
            <div className="space-y-3">
              {activeTab === "videos"
                ? videos.map(video => <SearchCard key={video._id} video={video} onClick={() => router.push(`/place/${video.placeId && typeof video.placeId === "object" ? video.placeId._id : video.placeId}`)} />)
                : places.map(place => <SearchPlaceCard key={place._id} place={place} onClick={() => router.push(`/map?placeId=${place._id}`)} />)
              }
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function SearchCard({ video, onClick }: { video: IVideo; onClick: () => void }) {
  const cat = CATEGORIES.find(c => c.value === video.category);
  const creator = typeof video.creatorId === "object" ? video.creatorId as { fullName: string } : null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-left active:scale-[0.98] transition-all hover:bg-white/5 shadow-lg"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/5">
        {video.thumbnailUrl
          ? <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[15%]" />
          : <div className="w-full h-full flex items-center justify-center text-2xl grayscale">{cat?.emoji || "🎬"}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate drop-shadow-sm">{video.title}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] font-bold text-zinc-400 truncate uppercase tracking-wider">{video.placeName || ""}, {video.district || ""}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{creator?.fullName || "Creator"}</span>
          <span className="text-[10px] font-bold text-zinc-500 uppercase">{formatRelativeTime(video.createdAt)}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
    </button>
  );
}

function SearchPlaceCard({ place, onClick }: { place: IPlace; onClick: () => void }) {
  const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-left active:scale-[0.98] transition-all hover:bg-white/5 shadow-lg"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 relative border border-white/5">
        {place.thumbnailUrl
          ? <img src={place.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[15%]" />
          : <div className="w-full h-full flex items-center justify-center text-2xl bg-black/40 grayscale">{emoji}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate drop-shadow-sm">{place.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-zinc-500" />
          <span className="text-[11px] font-bold text-zinc-400 truncate uppercase tracking-wider">{[place.city, place.district].filter(Boolean).join(", ")}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
    </button>
  );
}