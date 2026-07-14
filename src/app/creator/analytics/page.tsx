/*
"use client";

import { useEffect, useState } from "react";
import { Eye, Bookmark, Video, Users, TrendingUp, MapPin } from "lucide-react";
import { IVideo } from "@/types";
import { formatCount, cn } from "@/lib/utils";
import { CATEGORIES } from "@/constants";

const DISTRICT_BARS = [
  { name: "Kodagu", value: 9200, pct: 100, color: "#7c3aed" },
  { name: "Chikkamagaluru", value: 7400, pct: 80, color: "#3b82f6" },
  { name: "Mysuru", value: 6800, pct: 74, color: "#10b981" },
  { name: "Hassan", value: 5100, pct: 55, color: "#f59e0b" },
  { name: "Uttara Kannada", value: 4300, pct: 47, color: "#f43f5e" },
  { name: "Udupi", value: 3600, pct: 39, color: "#a78bfa" },
];

export default function CreatorAnalyticsPage() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("/api/videos/my-videos?status=APPROVED")
      .then(r => r.json())
      .then(d => { if (d.success) setVideos(d.data.videos || []); })
      .finally(() => setLoading(false));
  }, []);

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalSaves = videos.reduce((s, v) => s + (v.savesCount || 0), 0);

  const topByViews = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const topBySaves = [...videos].sort((a, b) => (b.savesCount || 0) - (a.savesCount || 0)).slice(0, 5);

  return (
    <div className="px-4 pt-5 pb-6">
      <div className="mb-5">
        <h2 className="text-xl font-black text-white">My Analytics</h2>
        <p className="text-xs text-[#475569] mt-0.5">Performance of your approved stories</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: Eye, label: "Total views", value: formatCount(totalViews), color: "text-[#a78bfa]", bg: "bg-[#7c3aed]/8 border-[#7c3aed]/15" },
          { icon: Bookmark, label: "Total saves", value: formatCount(totalSaves), color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
          { icon: Video, label: "Live videos", value: String(videos.length), color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/15" },
          { icon: Users, label: "Avg saves/video", value: videos.length > 0 ? formatCount(Math.round(totalSaves / videos.length)) : "0", color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/15" },
        ].map(m => (
          <div key={m.label} className={cn("rounded-2xl p-4 border", m.bg)}>
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", m.bg)}>
              <m.icon className={cn("w-[18px] h-[18px]", m.color)} />
            </div>
            {loading
              ? <div className="h-6 w-12 skeleton rounded mb-1" />
              : <p className={cn("text-2xl font-black", m.color)}>{m.value}</p>
            }
            <p className="text-[10px] text-[#475569] mt-0.5 font-semibold">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Trending Districts (Static for now, but you can wire this up later!) *}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#60a5fa]" />
          <p className="text-sm font-black text-white">Trending districts</p>
        </div>
        <div className="space-y-3">
          {DISTRICT_BARS.map(d => (
            <div key={d.name} className="flex items-center gap-3">
              <span className="text-xs text-[#64748b] w-[110px] flex-shrink-0 truncate">{d.name}</span>
              <div className="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.pct}%`, background: d.color }} />
              </div>
              <span className="text-xs font-bold text-[#64748b] w-10 text-right flex-shrink-0">
                {(d.value / 1000).toFixed(1)}k
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-black text-white mb-3">Your most viewed places</p>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-2xl" />)}</div>
        ) : topByViews.length === 0 ? (
           <p className="text-xs text-[#475569]">No approved videos yet.</p>
        ) : (
          <div className="space-y-2">
            {topByViews.map((v, i) => {
              const cat = CATEGORIES.find(c => c.value === v.category);
              const rankColors = ["text-amber-400","text-slate-400","text-amber-700"];
              return (
                <div key={v._id} className="flex items-center gap-3 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3">
                  <span className={cn("text-base font-black w-5 text-center flex-shrink-0", rankColors[i] || "text-[#475569]")}>{i+1}</span>
                  <div className="w-9 h-9 rounded-xl bg-[#1e293b] overflow-hidden flex-shrink-0">
                    {v.thumbnailUrl
                      ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">{cat?.emoji || "🎬"}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{v.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#475569]" />
                      <span className="text-[10px] text-[#475569] truncate">{v.placeName || ""}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-[#60a5fa]">{formatCount(v.views)}</p>
                    <p className="text-[9px] text-[#475569]">views</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-black text-white mb-3">Your most saved places</p>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-2xl" />)}</div>
        ) : topBySaves.length === 0 ? (
           <p className="text-xs text-[#475569]">No approved videos yet.</p>
        ) : (
          <div className="space-y-2">
            {topBySaves.map((v, i) => {
              const cat = CATEGORIES.find(c => c.value === v.category);
              return (
                <div key={v._id} className="flex items-center gap-3 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-3">
                  <span className="text-xs font-black text-[#475569] w-5 text-center flex-shrink-0">{i+1}</span>
                  <div className="w-9 h-9 rounded-xl bg-[#1e293b] overflow-hidden flex-shrink-0">
                    {v.thumbnailUrl
                      ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">{cat?.emoji || "🎬"}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{v.title}</p>
                    <p className="text-[10px] text-[#475569]">{v.district || ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-emerald-400">{formatCount(v.savesCount)}</p>
                    <p className="text-[9px] text-[#475569]">saves</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

*/


"use client";

import { useEffect, useState } from "react";
import { Eye, Bookmark, Video, Users, TrendingUp, MapPin } from "lucide-react";
import { IVideo } from "@/types";
import { formatCount, cn } from "@/lib/utils";
import { CATEGORIES } from "@/constants";

const DISTRICT_BARS = [
  { name: "Kodagu", value: 9200, pct: 100, color: "#ffffff" },
  { name: "Chikkamagaluru", value: 7400, pct: 80, color: "#d4d4d8" },
  { name: "Mysuru", value: 6800, pct: 74, color: "#a1a1aa" },
  { name: "Hassan", value: 5100, pct: 55, color: "#71717a" },
  { name: "Uttara Kannada", value: 4300, pct: 47, color: "#52525b" },
  { name: "Udupi", value: 3600, pct: 39, color: "#3f3f46" },
];

export default function CreatorAnalyticsPage() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos/my-videos?status=APPROVED")
      .then(r => r.json())
      .then(d => { if (d.success) setVideos(d.data.videos || []); })
      .finally(() => setLoading(false));
  }, []);

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalSaves = videos.reduce((s, v) => s + (v.savesCount || 0), 0);

  const topByViews = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const topBySaves = [...videos].sort((a, b) => (b.savesCount || 0) - (a.savesCount || 0)).slice(0, 5);

  return (
    <div className="relative min-h-dvh scenery-bg">
      {/* Dark gradient overlay matching the Login Page */}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 px-4 pt-5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-white drop-shadow-md">My Analytics</h2>
          <p className="text-xs text-zinc-400 mt-0.5 drop-shadow-md">Performance of your approved stories</p>
        </div>

        {/* Key metrics - Glassmorphic cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Eye, label: "Total views", value: formatCount(totalViews) },
            { icon: Bookmark, label: "Total saves", value: formatCount(totalSaves) },
            { icon: Video, label: "Live videos", value: String(videos.length) },
            { icon: Users, label: "Avg saves/video", value: videos.length > 0 ? formatCount(Math.round(totalSaves / videos.length)) : "0" },
          ].map(m => (
            <div key={m.label} className="rounded-2xl p-4 border border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white/5 border border-white/5">
                <m.icon className="w-[18px] h-[18px] text-white" />
              </div>
              {loading
                ? <div className="h-6 w-12 skeleton rounded mb-1 opacity-50" />
                : <p className="text-2xl font-black text-white drop-shadow-sm">{m.value}</p>
              }
              <p className="text-[10px] text-zinc-400 mt-0.5 font-semibold uppercase tracking-wider">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Trending Districts */}
        <p className="text-[10px] font-black text-zinc-500 tracking-widest mb-3 uppercase drop-shadow-sm">Trending Districts</p>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-white" />
            <p className="text-sm font-black text-white drop-shadow-sm">Location popularity</p>
          </div>
          <div className="space-y-3">
            {DISTRICT_BARS.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-xs text-zinc-300 w-[110px] flex-shrink-0 truncate">{d.name}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
                <span className="text-xs font-bold text-zinc-400 w-10 text-right flex-shrink-0">
                  {(d.value / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most viewed places */}
        <div className="mb-5">
          <p className="text-[10px] font-black text-zinc-500 tracking-widest mb-3 uppercase drop-shadow-sm">Your most viewed places</p>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-2xl opacity-50" />)}</div>
          ) : topByViews.length === 0 ? (
             <p className="text-xs text-zinc-400">No approved videos yet.</p>
          ) : (
            <div className="space-y-2">
              {topByViews.map((v, i) => {
                const cat = CATEGORIES.find(c => c.value === v.category);
                const rankColors = ["text-white", "text-zinc-300", "text-zinc-500"];
                return (
                  <div key={v._id} className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl hover:bg-white/5 transition-all">
                    <span className={cn("text-base font-black w-5 text-center flex-shrink-0 drop-shadow-sm", rankColors[i] || "text-zinc-600")}>{i+1}</span>
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                        : <div className="w-full h-full flex items-center justify-center text-zinc-400">{cat?.emoji || "🎬"}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate drop-shadow-sm">{v.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-zinc-500" />
                        <span className="text-[10px] text-zinc-400 truncate">{v.placeName || ""}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-white">{formatCount(v.views)}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">views</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Most saved places */}
        <div>
          <p className="text-[10px] font-black text-zinc-500 tracking-widest mb-3 uppercase drop-shadow-sm">Your most saved places</p>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-2xl opacity-50" />)}</div>
          ) : topBySaves.length === 0 ? (
             <p className="text-xs text-zinc-400">No approved videos yet.</p>
          ) : (
            <div className="space-y-2">
              {topBySaves.map((v, i) => {
                const cat = CATEGORIES.find(c => c.value === v.category);
                return (
                  <div key={v._id} className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl hover:bg-white/5 transition-all">
                    <span className="text-xs font-black text-zinc-600 w-5 text-center flex-shrink-0">{i+1}</span>
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                        : <div className="w-full h-full flex items-center justify-center text-zinc-400">{cat?.emoji || "🎬"}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate drop-shadow-sm">{v.title}</p>
                      <p className="text-[10px] text-zinc-400">{v.district || ""}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-white">{formatCount(v.savesCount)}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">saves</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}