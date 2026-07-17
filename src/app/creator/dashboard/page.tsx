/*
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, Heart, Bookmark, Route, Bell,
  TrendingUp, CheckCircle2, Clock, XCircle,
  ChevronRight, MapPin, Star, Upload
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { IVideo } from "@/types";
import { formatCount, formatRelativeTime, cn } from "@/lib/utils";
import { CATEGORIES, VIDEO_STATUS } from "@/constants";

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalViews: number;
  totalSaves: number;
}

// Mini bar chart
function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div className="flex items-end gap-1.5 h-[70px]">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${Math.max((v / max) * 60, 4)}px`,
              background: i === data.length - 1
                ? "#7c3aed"
                : i >= data.length - 3
                  ? "#a78bfa"
                  : "#2a2a3e",
            }}
          />
          <span className="text-[8px] text-[#555577]">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats]   = useState<Stats>({ total:0, approved:0, pending:0, rejected:0, totalViews:0, totalSaves:0 });
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fake weekly view data — in V2 this comes from analytics API
  const weeklyViews = [420, 580, 490, 720, 950, 680, 540];

  useEffect(() => {
    const load = async () => {
      const res  = await fetch("/api/videos/my-videos");
      const data = await res.json();
      if (data.success) {
        const vids: IVideo[] = data.data.videos;
        setVideos(vids.slice(0, 3));
        setStats({
          total:      vids.length,
          approved:   vids.filter(v => v.status === "APPROVED").length,
          pending:    vids.filter(v => v.status === "PENDING").length,
          rejected:   vids.filter(v => v.status === "REJECTED").length,
          totalViews: vids.reduce((s, v) => s + (v.views || 0), 0),
          totalSaves: vids.reduce((s, v) => s + (v.savesCount || 0), 0),
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-dvh bg-[#0d0d16] pb-4">

      
      <div className="bg-[#0d0d16] px-4 pt-14 pb-4 border-b border-[#1e1e2e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
           
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-base font-black text-white border border-[#7c3aed]/30">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-white">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#7c3aed] flex items-center justify-center">
                  <span className="text-[7px] text-white font-black">✓</span>
                </div>
                <span className="text-[10px] text-[#a78bfa] font-semibold">Verified Creator</span>
              </div>
            </div>
          </div>
          {/* <button className="w-9 h-9 rounded-xl bg-[#161622] border border-[#2a2a3e] flex items-center justify-center relative">
            <Bell className="w-4 h-4 text-[#9ca3af]" />
            {stats.pending > 0 && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f43f5e]" />
            )}
          </button> *}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Eye,       label: "Total views",     value: formatCount(stats.totalViews), color: "text-[#a78bfa]", bg: "bg-[#7c3aed]/8 border-[#7c3aed]/15" },
            { icon: Bookmark,  label: "Total saves",     value: formatCount(stats.totalSaves), color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
            { icon: Route,     label: "Itinerary adds",  value: "—",                          color: "text-blue-400",    bg: "bg-blue-500/8 border-blue-500/15" },
            { icon: CheckCircle2, label: "Published",    value: String(stats.approved),        color: "text-amber-400",   bg: "bg-amber-500/8 border-amber-500/15" },
          ].map(s => (
            <div key={s.label} className={cn("rounded-2xl p-4 border", s.bg)}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                <s.icon className={cn("w-4.5 h-4.5", s.color)} style={{ width:18, height:18 }} />
              </div>
              {loading
                ? <div className="h-6 w-12 skeleton rounded mb-1" />
                : <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
              }
              <p className="text-[10px] text-[#555577] mt-0.5 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        
        <div className="bg-[#161622] border border-[#2a2a3e] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-white">Views this week</p>
              <p className="text-[10px] text-[#555577] mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#a78bfa] font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              +18%
            </div>
          </div>
          <BarChart data={weeklyViews} />
        </div>

        
        <div className="bg-gradient-to-br from-[#1e0a3c] to-[#120827] border border-[#7c3aed]/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#7c3aed]/15 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-400">Explorer Spotlight</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">You are this week's featured creator</p>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Your story was saved{" "}
              <span className="text-[#a78bfa] font-bold">{formatCount(stats.totalSaves)}</span>{" "}
              times this week.
            </p>
          </div>
        </div>

        
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-white">Recent content</p>
            <button onClick={() => router.push("/creator/content")} className="flex items-center gap-0.5 text-xs text-[#a78bfa] font-bold">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
          ) : videos.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-3xl mb-2">🎬</div>
              <p className="text-sm font-bold text-white mb-1">No uploads yet</p>
              <button onClick={() => router.push("/creator/upload")} className="text-xs text-[#a78bfa] font-semibold mt-1 flex items-center gap-1 mx-auto">
                <Upload className="w-3.5 h-3.5" /> Upload your first story
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map(v => {
                const status = VIDEO_STATUS[v.status];
                const cat    = CATEGORIES.find(c => c.value === v.category);
                const StatusIcon = v.status === "APPROVED" ? CheckCircle2 : v.status === "REJECTED" ? XCircle : Clock;
                return (
                  <button key={v._id} onClick={() => router.push(`/place/${v._id}`)}
                    className="w-full flex items-center gap-3 bg-[#161622] border border-[#2a2a3e] rounded-2xl p-3 text-left active:opacity-70 transition-all">
                    <div className="w-14 h-14 rounded-xl bg-[#1e1e2e] flex-shrink-0 overflow-hidden">
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">{cat?.emoji || "🎬"}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{v.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#555577]" />
                        <span className="text-[11px] text-[#555577] truncate">{v.placeName}, {v.district}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", status.bg, status.color)}>
                          <StatusIcon style={{ width:9, height:9 }} />
                          {status.label}
                        </div>
                        <span className="text-[10px] text-[#555577]">{formatCount(v.views)} views</span>
                        <span className="text-[10px] text-[#555577]">{formatCount(v.savesCount)} saves</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-white">My collections</p>
            <button className="text-xs text-[#a78bfa] font-bold">Manage</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["💧 Waterfalls","🏛 Heritage","🥾 Treks","➕ New"].map(label => (
              <div key={label} className="flex-shrink-0 flex items-center gap-1.5 bg-[#161622] border border-[#2a2a3e] rounded-full px-3 py-2 text-xs text-[#9ca3af] font-medium">
                {label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

*/

//working


/*

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, Heart, Bookmark, Route, Bell,
  TrendingUp, CheckCircle2, Clock, XCircle,
  ChevronRight, MapPin, Star, Upload
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { IVideo } from "@/types";
import { formatCount, formatRelativeTime, cn } from "@/lib/utils";
import { CATEGORIES, VIDEO_STATUS } from "@/constants";

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalViews: number;
  totalSaves: number;
}

// Minimalist Monochrome Bar Chart
function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div className="flex items-end gap-1.5 h-[70px]">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-full rounded-t-sm transition-all duration-500",
              i === data.length - 1 ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "bg-white/20"
            )}
            style={{
              height: `${Math.max((v / max) * 60, 4)}px`,
            }}
          />
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats]   = useState<Stats>({ total:0, approved:0, pending:0, rejected:0, totalViews:0, totalSaves:0 });
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fake weekly view data — in V2 this comes from analytics API
  const weeklyViews = [420, 580, 490, 720, 950, 680, 540];

  useEffect(() => {
    const load = async () => {
      const res  = await fetch("/api/videos/my-videos");
      const data = await res.json();
      if (data.success) {
        const vids: IVideo[] = data.data.videos;
        setVideos(vids.slice(0, 3));
        setStats({
          total:      vids.length,
          approved:   vids.filter(v => v.status === "APPROVED").length,
          pending:    vids.filter(v => v.status === "PENDING").length,
          rejected:   vids.filter(v => v.status === "REJECTED").length,
          totalViews: vids.reduce((s, v) => s + (v.views || 0), 0),
          totalSaves: vids.reduce((s, v) => s + (v.savesCount || 0), 0),
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="relative min-h-dvh scenery-bg">
      {/* ── Cinematic Overlay ── *}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* ── Header ── *}
      <div className="relative z-10 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar *}
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl font-black text-black shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-black text-white drop-shadow-sm">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Verified Creator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-4 space-y-5">

        {/* ── Stats 2×2 ── *}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Eye,       label: "Total views",    value: formatCount(stats.totalViews) },
            { icon: Bookmark,  label: "Total saves",    value: formatCount(stats.totalSaves) },
            { icon: Route,     label: "Itinerary adds", value: "0" },
            { icon: CheckCircle2, label: "Published",    value: String(stats.approved) },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center mb-3">
                <s.icon className="w-4.5 h-4.5 text-white" style={{ width:18, height:18 }} />
              </div>
              {loading
                ? <div className="h-6 w-12 skeleton rounded mb-1 bg-white/10" />
                : <p className="text-2xl font-black text-white">{s.value}</p>
              }
              <p className="text-[10px] text-zinc-400 mt-0.5 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Views this week chart ── }
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-white">Views this week</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white font-black bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              <TrendingUp className="w-3.5 h-3.5" />
              +18%
            </div>
          </div>
          <BarChart data={weeklyViews} />
        </div>

        {/* ── Spotlight card ── *}
        <div className="bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-xs font-black text-white uppercase tracking-wider">Explorer Spotlight</span>
            </div>
            <p className="text-sm font-black text-white mb-1 drop-shadow-md">You are this week's featured creator</p>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              Your story was saved{" "}
              <span className="text-white font-black bg-white/20 px-1.5 py-0.5 rounded-md mx-0.5">{formatCount(stats.totalSaves)}</span>{" "}
              times this week.
            </p>
          </div>
        </div>

        {/* ── Recent content ── *}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm font-black text-white uppercase tracking-wider">Recent content</p>
            <button onClick={() => router.push("/creator/content")} className="flex items-center gap-0.5 text-xs text-zinc-400 font-bold hover:text-white transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl bg-white/5" />)}</div>
          ) : videos.length === 0 ? (
            <div className="py-10 text-center bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl">
              <div className="text-3xl mb-2 grayscale">🎬</div>
              <p className="text-sm font-black text-white mb-1">No uploads yet</p>
              <button onClick={() => router.push("/creator/upload")} className="text-xs text-white font-bold mt-2 flex items-center gap-1.5 mx-auto bg-white/10 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                <Upload className="w-3.5 h-3.5" /> Upload your first story
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map(v => {
                const status = VIDEO_STATUS[v.status];
                const cat    = CATEGORIES.find(c => c.value === v.category);
                const StatusIcon = v.status === "APPROVED" ? CheckCircle2 : v.status === "REJECTED" ? XCircle : Clock;
                return (
                  <button key={v._id} onClick={() => router.push(`/place/${v._id}`)}
                    className="w-full flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-left active:scale-[0.98] hover:bg-white/5 transition-all shadow-lg">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden border border-white/5">
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                        : <div className="w-full h-full flex items-center justify-center text-xl grayscale">{cat?.emoji || "🎬"}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate drop-shadow-sm">{v.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span className="text-[11px] font-medium text-zinc-400 truncate">{v.placeName}, {v.district}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={cn("flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", status.bg, status.color)}>
                          <StatusIcon style={{ width:10, height:10 }} />
                          {status.label}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">{formatCount(v.views)} views</span>
                        <span className="text-[10px] font-bold text-zinc-500">{formatCount(v.savesCount)} saves</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Collections row ── *}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm font-black text-white uppercase tracking-wider">My collections</p>
            <button className="text-xs text-zinc-400 font-bold hover:text-white transition-colors">Manage</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {["💧 Waterfalls","🏛 Heritage","🥾 Treks","➕ New"].map(label => (
              <div key={label} className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5 text-xs text-white font-bold shadow-sm hover:bg-white/10 transition-colors cursor-pointer">
                {label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

*/

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, Heart, Bookmark, Route, Bell,
  TrendingUp, CheckCircle2, Clock, XCircle,
  ChevronRight, MapPin, Star, Upload
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { IVideo } from "@/types";
import { formatCount, formatRelativeTime, cn } from "@/lib/utils";
import { CATEGORIES, VIDEO_STATUS } from "@/constants";

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalViews: number;
  totalSaves: number;
}

// Minimalist Monochrome Bar Chart
function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div className="flex items-end gap-1.5 h-[70px]">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={cn(
              "w-full rounded-t-sm transition-all duration-500",
              i === data.length - 1 ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "bg-white/20"
            )}
            style={{
              height: `${Math.max((v / max) * 60, 4)}px`,
            }}
          />
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats]   = useState<Stats>({ total:0, approved:0, pending:0, rejected:0, totalViews:0, totalSaves:0 });
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fake weekly view data — in V2 this comes from analytics API
  const weeklyViews = [420, 580, 490, 720, 950, 680, 540];

  useEffect(() => {
    const load = async () => {
      const res  = await fetch("/api/videos/my-videos");
      const data = await res.json();
      if (data.success) {
        const vids: IVideo[] = data.data.videos;
        setVideos(vids.slice(0, 3));
        setStats({
          total:      vids.length,
          approved:   vids.filter(v => v.status === "APPROVED").length,
          pending:    vids.filter(v => v.status === "PENDING").length,
          rejected:   vids.filter(v => v.status === "REJECTED").length,
          totalViews: vids.reduce((s, v) => s + (v.views || 0), 0),
          totalSaves: vids.reduce((s, v) => s + (v.savesCount || 0), 0),
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="relative min-h-dvh scenery-bg">
      {/* ── Cinematic Overlay ── */}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl font-black text-black shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-black text-white drop-shadow-sm">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Verified Creator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-4 space-y-5">

        {/* ── Stats 2×2 ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Eye,       label: "Total views",    value: formatCount(stats.totalViews) },
            { icon: Bookmark,  label: "Total saves",    value: formatCount(stats.totalSaves) },
            { icon: Route,     label: "Itinerary adds", value: "0" },
            { icon: CheckCircle2, label: "Published",    value: String(stats.approved) },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center mb-3">
                <s.icon className="w-4.5 h-4.5 text-white" style={{ width:18, height:18 }} />
              </div>
              {loading
                ? <div className="h-6 w-12 skeleton rounded mb-1 bg-white/10" />
                : <p className="text-2xl font-black text-white">{s.value}</p>
              }
              <p className="text-[10px] text-zinc-400 mt-0.5 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Views this week chart ── */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-white">Views this week</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white font-black bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              <TrendingUp className="w-3.5 h-3.5" />
              +18%
            </div>
          </div>
          <BarChart data={weeklyViews} />
        </div>

        {/* ── Spotlight card ── */}
        <div className="bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-xs font-black text-white uppercase tracking-wider">Explorer Spotlight</span>
            </div>
            <p className="text-sm font-black text-white mb-1 drop-shadow-md">You are this week's featured creator</p>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              Your story was saved{" "}
              <span className="text-white font-black bg-white/20 px-1.5 py-0.5 rounded-md mx-0.5">{formatCount(stats.totalSaves)}</span>{" "}
              times this week.
            </p>
          </div>
        </div>

        {/* ── Recent content ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm font-black text-white uppercase tracking-wider">Recent content</p>
            <button onClick={() => router.push("/creator/content")} className="flex items-center gap-0.5 text-xs text-zinc-400 font-bold hover:text-white transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl bg-white/5" />)}</div>
          ) : videos.length === 0 ? (
            <div className="py-10 text-center bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl">
              <div className="text-3xl mb-2 grayscale">🎬</div>
              <p className="text-sm font-black text-white mb-1">No uploads yet</p>
              <button onClick={() => router.push("/creator/upload")} className="text-xs text-white font-bold mt-2 flex items-center gap-1.5 mx-auto bg-white/10 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                <Upload className="w-3.5 h-3.5" /> Upload your first story
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map(v => {
                const status = VIDEO_STATUS[v.status];
                const cat    = CATEGORIES.find(c => c.value === v.category);
                const StatusIcon = v.status === "APPROVED" ? CheckCircle2 : v.status === "REJECTED" ? XCircle : Clock;
                return (
                  <button 
                    key={v._id} 
                    onClick={() => {
                      // FIX: Extract Place ID safely to prevent 404 on Video ID
                      const targetPlaceId = typeof v.placeId === "object" ? (v.placeId as any)?._id : v.placeId;
                      if (targetPlaceId) {
                        router.push(`/place/${targetPlaceId}`);
                      }
                    }}
                    className="w-full flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-left active:scale-[0.98] hover:bg-white/5 transition-all shadow-lg">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden border border-white/5">
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                        : <div className="w-full h-full flex items-center justify-center text-xl grayscale">{cat?.emoji || "🎬"}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate drop-shadow-sm">{v.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span className="text-[11px] font-medium text-zinc-400 truncate">{v.placeName}, {v.district}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={cn("flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", status.bg, status.color)}>
                          <StatusIcon style={{ width:10, height:10 }} />
                          {status.label}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">{formatCount(v.views)} views</span>
                        <span className="text-[10px] font-bold text-zinc-500">{formatCount(v.savesCount)} saves</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Collections row ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-sm font-black text-white uppercase tracking-wider">My collections</p>
            <button className="text-xs text-zinc-400 font-bold hover:text-white transition-colors">Manage</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {["💧 Waterfalls","🏛 Heritage","🥾 Treks","➕ New"].map(label => (
              <div key={label} className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5 text-xs text-white font-bold shadow-sm hover:bg-white/10 transition-colors cursor-pointer">
                {label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}