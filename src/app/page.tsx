"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Search, Bell, ChevronRight
} from "lucide-react";
import { IVideo, IPlace } from "@/types";
import { useAuth } from "@/features/auth/AuthContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { RadiusSlider } from "@/features/home/RadiusSlider";
import { GemCard } from "@/features/home/GemCard";
import { PlaceCard } from "@/components/shared/PlaceCard";
import { TrendingItem } from "@/features/home/TrendingItem";
import { StoryCard } from "@/features/home/StoryCard";
import { SectionHeader } from "@/features/home/SectionHeader";
import LandingPage from "@/features/auth/LandingPage";
import { cn } from "@/lib/utils";

const MOOD_FILTERS = [
  { label: "All",        value: "",          emoji: "✨" },
  { label: "Nature",     value: "NATURE",    emoji: "🌿" },
  { label: "Heritage",   value: "HERITAGE",  emoji: "🏛"  },
  { label: "Food",       value: "FOOD",      emoji: "🍛"  },
  { label: "Trekking",   value: "TREKKING",  emoji: "🥾"  },
  { label: "Waterfall",  value: "WATERFALL", emoji: "💧"  },
  { label: "Hidden Gem", value: "HIDDEN_GEM", emoji: "💎"  },
];

const GREETINGS = ["Good morning", "Good afternoon", "Good evening"];
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? GREETINGS[0] : h < 17 ? GREETINGS[1] : GREETINGS[2];
};

const COLLECTIONS = [
  { emoji: "🌧", name: "Monsoon Escapes",  cat: "NATURE",    bg: "#121212" },
  { emoji: "🏞", name: "Hidden Waterfalls", cat: "WATERFALL", bg: "#1a1a1a" },
  { emoji: "🍛", name: "Food Trails",      cat: "FOOD",      bg: "#222222" },
  { emoji: "🏛", name: "Heritage Walks",   cat: "HERITAGE",  bg: "#18181b" },
];

export default function RootPage() {
  const { user, loading } = useAuth();

  if (!loading && !user) return <LandingPage />;

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <HomePage />;
}

// ── Authenticated Home ────────────────────────────────────────────────
function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [trending, setTrending] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(50);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("Karnataka");
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationLabel("Near you");
      },
      () => setLocationLabel("Karnataka"),
      { timeout: 6000 }
    );
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "12" });
      if (category) params.set("category", category);
      if (userLocation && radius < 300) {
        params.set("radius", String(radius));
        params.set("lat", String(userLocation.lat));
        params.set("lon", String(userLocation.lon));
      }
      const res = await fetch(`/api/videos?${params}`);
      const data = await res.json();
      
      // FIX: Defensive fallback to ensure videos is ALWAYS an array
      if (data.success) {
        setVideos(data?.data?.videos || []);
      } else {
        setVideos([]);
      }
    } catch (err) {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [category, radius, userLocation]);

  useEffect(() => {
    fetch("/api/videos?page=1&limit=10")
      .then(r => r.json())
      .then(d => {
        // FIX: Defensive fallback to prevent crash if data is missing
        if (d.success && Array.isArray(d?.data?.videos)) {
          const sorted = [...d.data.videos].sort(
            (a: IVideo, b: IVideo) => b.savesCount - a.savesCount
          );
          setTrending(sorted.slice(0, 3));
        } else {
          setTrending([]);
        }
      })
      .catch(() => setTrending([]));
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  useEffect(() => {
    if (userLocation) {
      setPlacesLoading(true);
      fetch(`/api/places?lat=${userLocation.lat}&lng=${userLocation.lon}&radius=50&limit=10`)
        .then(r => r.json())
        .then(d => {
          // FIX: Defensive fallback for places
          if (d.success) setPlaces(d?.data?.places || []);
        })
        .catch(() => setPlaces([]))
        .finally(() => setPlacesLoading(false));
    }
  }, [userLocation]);

  const firstName = user?.fullName?.split(" ")[0] || "Explorer";

  return (
    <div className="relative min-h-dvh scenery-bg">
      {/* ── Cinematic Overlay ── */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

      {/* ── HERO HEADER ── */}
      <div className="relative bg-gradient-to-b from-zinc-900 via-black to-black px-4 pt-14 pb-5 overflow-hidden">
        {/* bg glows */}
        <div className="absolute top-0 right-0 w-52 h-52 rounded-full bg-white/5 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Top row */}
        <div className="flex items-start justify-between mb-5 relative">
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">{getGreeting()} 👋</p>
            <h1 className="text-xl font-black text-white leading-tight">{firstName}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white pulse-dot" />
              <span className="text-xs text-zinc-400">
                {locationLabel}
                {radius < 300 ? ` · ${radius} km radius` : " · All Karnataka"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <button className="relative w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Bell className="w-4 h-4 text-zinc-400" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white" />
            </button>
            <button
              onClick={() => router.push("/search")}
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
            >
              <Search className="w-4 h-4 text-zinc-400" />
            </button> */}
          </div>
        </div>

        {/* Search bar */}
        <button
          onClick={() => router.push("/search")}
          className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 mb-4 hover:border-zinc-600 active:opacity-80 transition-all"
        >
          <Search className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-500">Places, food, trails, stories...</span>
          <div className="ml-auto flex items-center gap-1 bg-white/10 border border-zinc-700 rounded-xl px-2.5 py-1">
            <MapPin className="w-3 h-3 text-white" />
            <span className="text-[10px] text-white font-bold">Karnataka</span>
          </div>
        </button>

        {/* Radius slider */}
        <div className="mb-4">
          <RadiusSlider
            radius={radius}
            onChange={setRadius}
            hasLocation={!!userLocation}
            open={sliderOpen}
            onToggle={() => setSliderOpen(o => !o)}
          />
        </div>

        {/* Mood filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {MOOD_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value === category ? "" : f.value)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-all",
                category === f.value
                  ? "bg-white border-white text-black"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
              )}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── NEARBY PLACES ── */}
      {userLocation && (
        <section className="mt-2 mb-6">
          <SectionHeader
            title="Nearby Places"
            sub="Explore locations around you"
            onSeeAll={() => router.push("/map")}
          />
          <div className="flex gap-3 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {placesLoading
              ? [1,2,3].map(i => <div key={i} className="flex-shrink-0 w-44 h-56 skeleton" />)
              : places.length === 0
              ? <p className="text-sm text-zinc-400 px-2">No places found nearby. Try expanding radius on the map.</p>
              : places.map(p => (
                  <PlaceCard key={p._id} place={p} />
                ))
            }
          </div>
        </section>
      )}

      {/* ── HIDDEN GEMS ── */}
      <section className="mb-6">
        <SectionHeader
          title={radius < 300 ? "Hidden gems near you" : "Hidden gems"}
          sub={radius < 300 ? `Within ${radius} km` : "Across Karnataka"}
          onSeeAll={() => router.push("/explore")}
        />
        <div className="flex gap-3 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {loading
            ? [1, 2, 3, 4].map(i => <div key={i} className="flex-shrink-0 w-36 h-52 skeleton rounded-2xl" />)
            : videos?.slice(0, 8).map(v => {
                // Safely extract the place ID whether it's an object or a string
                const targetId = typeof v.placeId === "object" ? (v.placeId as any)._id : v.placeId;
                
                return (
                  <GemCard 
                    key={v._id} 
                    video={v} 
                    onClick={() => router.push(`/place/${targetId}`)} 
                  />
                );
              })
          }
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className="mb-6">
        <SectionHeader
          title="Trending this week"
          sub="Sorted by saves · not likes"
          onSeeAll={() => router.push("/explore")}
        />
        <div className="px-4 space-y-2">
          {trending.length === 0
            ? [1, 2, 3].map(i => <div key={i} className="h-16 skeleton rounded-2xl" />)
            : trending.map((v, i) => {
                // Safely extract the place ID
                const targetId = typeof v.placeId === "object" && v.placeId !== null 
                  ? (v.placeId as any)._id 
                  : v.placeId;

                return (
                  <TrendingItem 
                    key={v._id} 
                    video={v} 
                    rank={i + 1} 
                    onClick={() => router.push(`/place/${targetId}`)} 
                  />
                );
              })
          }
        </div>
      </section>

      {/* <section className="mb-6">
        <SectionHeader
          title="Curated collections"
          sub="Handpicked journeys"
          onSeeAll={() => router.push("/explore")}
        />
        <div className="grid grid-cols-2 gap-3 px-4">
          {COLLECTIONS.map(c => (
            <button
              key={c.cat}
              onClick={() => {
                setCategory(c.cat);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-2xl overflow-hidden active:scale-[0.97] transition-all border border-zinc-800"
              style={{ background: c.bg }}
            >
              <div className="p-4 min-h-[90px] flex flex-col justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <div>
                  <p className="text-xs font-black text-white">{c.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Explore →</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <SectionHeader
          title="Stories from Karnataka"
          sub="Documentary-style"
          onSeeAll={() => router.push("/explore")}
        />
        <div className="flex gap-3 px-4 overflow-x-auto pb-1">
          {loading
            ? [1,2,3].map(i => <div key={i} className="flex-shrink-0 w-52 h-28 skeleton rounded-2xl" />)
            : videos?.slice(0, 5).map(v => (
                <StoryCard key={v._id} video={v} onClick={() => router.push(`/place/${v._id}`)} />
              ))
          }
        </div>
      </section>

      <section className="mb-6 px-4">
        <SectionHeader title="Explorer Spotlight" sub="Top creator this week" />
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-lg font-black text-white border border-zinc-700">
                R
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white">Rajan Hegde</p>
                <p className="text-xs text-zinc-400">Local Expert · Western Ghats</p>
              </div>
              <div className="bg-white/10 border border-zinc-700 rounded-full px-2.5 py-1">
                <span className="text-[10px] text-white font-black">⭐ Spotlight</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              "Unknown temple hidden deep in the Western Ghats" — saved 340 times this week.
            </p>
            <button
              onClick={() => router.push("/explore")}
              className="mt-3 flex items-center gap-1 text-xs text-zinc-300 font-bold hover:text-white transition-colors"
            >
              Watch stories <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section> */}

      <BottomNav />
    </div>
  );
}
