/*
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, Settings, MapPin, Video, Bookmark,
  Clock, CheckCircle2, XCircle, ChevronRight,
  User, Shield, Camera, Edit3, Route, TrendingUp, Loader2
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { IVideo } from "@/types";
import { CATEGORIES } from "@/constants";
import { formatRelativeTime, cn } from "@/lib/utils";
import { BottomNav } from "@/components/layout/BottomNav";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

type VideoTab = "all" | "PENDING" | "APPROVED" | "REJECTED";

const TAB_LABELS: Record<VideoTab, string> = {
  all: "All", APPROVED: "Live", PENDING: "Pending", REJECTED: "Rejected",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [videos, setVideos]       = useState<IVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<VideoTab>("all");
  const { toasts, removeToast, toast } = useToast();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "CREATOR") fetchMyVideos("all");
  }, [user]);

  const fetchMyVideos = async (tab: VideoTab) => {
    setVideosLoading(true);
    try {
      const url = tab !== "all"
        ? `/api/videos/my-videos?status=${tab}`
        : "/api/videos/my-videos";
      const res  = await fetch(url);
      const data = await res.json();
      if (data.success) setVideos(data.data.videos);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleTabChange = (tab: VideoTab) => {
    setActiveTab(tab);
    fetchMyVideos(tab);
  };

  if (loading || !user) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  const counts: Record<VideoTab, number> = {
    all:      videos.length,
    PENDING:  videos.filter(v => v.status === "PENDING").length,
    APPROVED: videos.filter(v => v.status === "APPROVED").length,
    REJECTED: videos.filter(v => v.status === "REJECTED").length,
  };

  return (
    <div className="min-h-dvh bg-black pb-28">

     
      <div className="relative bg-gradient-to-b from-zinc-900 via-black to-black px-4 pt-14 pb-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        
        <div className="flex items-start justify-between mb-5 relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-[68px] h-[68px] rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl font-bold text-white border-2 border-zinc-700">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              {user.role === "CREATOR" && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center">
                  <Camera className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">{user.fullName}</h1>
              <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                @{user.fullName.replace(/\s+/g, "").toLowerCase()}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <RoleBadge role={user.role} />
                {user.district && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                    <MapPin className="w-2.5 h-2.5" />{user.district}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={logout}
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-colors hover:bg-zinc-800"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
            </button>
            <button
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-colors hover:bg-zinc-800"
              title="Edit profile"
            >
              <Edit3 className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        
        {user.role === "CREATOR" && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatCard value={counts.APPROVED} label="Published"
              color="text-white" bg="bg-zinc-900 border-zinc-800" />
            <StatCard value={counts.PENDING}  label="Pending"
              color="text-zinc-400"  bg="bg-zinc-900 border-zinc-800" />
            <StatCard value={counts.REJECTED} label="Rejected"
              color="text-zinc-500"  bg="bg-zinc-900 border-zinc-800" />
          </div>
        )}

        {user.role === "EXPLORER" && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatCard value={0} label="Saved"    color="text-white" bg="bg-zinc-900 border-zinc-800" />
            <StatCard value={0} label="Trips"    color="text-white" bg="bg-zinc-900 border-zinc-800" />
            <StatCard value={0} label="Explored" color="text-white" bg="bg-zinc-900 border-zinc-800" />
          </div>
        )}
      </div>

      
      {user.role === "CREATOR" && (
        <div className="px-4 mt-1">
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1 mb-4">
            {(["all", "APPROVED", "PENDING", "REJECTED"] as VideoTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all",
                  activeTab === tab
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:text-zinc-400"
                )}
              >
                {TAB_LABELS[tab]}
                <span className="ml-0.5 opacity-50 font-medium">({counts[tab]})</span>
              </button>
            ))}
          </div>

          {videosLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 skeleton rounded-2xl" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <EmptyVideos tab={activeTab} onUpload={() => router.push("/upload")} />
          ) : (
            <div className="space-y-3">
              {videos.map(video => (
                <VideoListCard
                  key={video._id}
                  video={video}
                  onClick={() => router.push(`/place/${video._id}`)}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => router.push("/upload")}
            className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 rounded-2xl py-4 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] transition-all"
          >
            <Camera className="w-4 h-4" />
            Upload new story
          </button>
        </div>
      )}

      
      {user.role === "EXPLORER" && (
        <div className="px-4 mt-2 space-y-5">
          <MenuSection title="MY CONTENT">
            <MenuItem icon={Bookmark} label="Saved places"   sub="Bookmarked videos"       onClick={() => router.push("/saved")} />
            <MenuItem icon={Route}    label="My trips"       sub="Planned itineraries"     onClick={() => router.push("/itineraries")} />
            <MenuItem icon={Video}    label="Saved videos"   sub="Videos you bookmarked"   onClick={() => router.push("/saved")} />
          </MenuSection>

          <MenuSection title="DISCOVER">
            <MenuItem icon={TrendingUp} label="Trending"       sub="Most saved places"       onClick={() => router.push("/")} />
            <MenuItem icon={MapPin}     label="Explore ROAM"   sub="Browse the video feed"   onClick={() => router.push("/explore")} />
          </MenuSection>

          <MenuSection title="ACCOUNT">
            <MenuItem icon={Settings} label="Settings" sub="Preferences & notifications"
              onClick={() => toast.info("Settings coming in V2")} />
            <MenuItem icon={LogOut} label="Sign out" sub="Log out of your account"
              onClick={logout} danger />
          </MenuSection>
        </div>
      )}

     
      {user.role === "CREATOR" && (
        <div className="px-4 mt-4 space-y-5">
          <MenuSection title="ACCOUNT">
            <MenuItem icon={Settings} label="Settings" sub="Preferences & notifications"
              onClick={() => toast.info("Settings coming in V2")} />
            <MenuItem icon={LogOut} label="Sign out" sub="Log out of your account"
              onClick={logout} danger />
          </MenuSection>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <BottomNav />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, { icon: React.ElementType; label: string; cls: string }> = {
    EXPLORER: { icon: User,   label: "Explorer", cls: "bg-zinc-800 text-zinc-300 border-zinc-700" },
    CREATOR:  { icon: Camera, label: "Creator",  cls: "bg-white text-black border-white" },
    ADMIN:    { icon: Shield, label: "Admin",    cls: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  };
  const c = cfg[role];
  if (!c) return null;
  return (
    <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", c.cls)}>
      <c.icon style={{ width: 10, height: 10 }} />
      {c.label}
    </span>
  );
}

function StatCard({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <div className={cn("rounded-2xl p-3 text-center border", bg)}>
      <div className={cn("text-xl font-bold tracking-tight", color)}>{value}</div>
      <div className="text-[10px] text-zinc-500 mt-0.5 font-medium tracking-wide uppercase">{label}</div>
    </div>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-zinc-500 tracking-widest uppercase mb-2 ml-1">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function MenuItem({
  icon: Icon, label, sub, onClick, danger = false,
}: {
  icon: React.ElementType; label: string; sub: string;
  onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-zinc-900 rounded-2xl border px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-all text-left",
        "border-zinc-800 hover:border-zinc-700"
      )}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-zinc-800">
        <Icon
          style={{ width: 18, height: 18 }}
          className={danger ? "text-zinc-400" : "text-white"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold tracking-tight", danger ? "text-zinc-400" : "text-white")}>{label}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-zinc-700" />}
    </button>
  );
}

function VideoListCard({ video, onClick }: { video: IVideo; onClick: () => void }) {
  const cat    = CATEGORIES.find(c => c.value === video.category);
  const StatusIcon =
    video.status === "APPROVED" ? CheckCircle2 :
    video.status === "REJECTED" ? XCircle : Clock;
    
  const statusCls = 
    video.status === "APPROVED" ? "bg-white text-black border-white" :
    video.status === "PENDING" ? "bg-zinc-900 text-zinc-400 border-zinc-700" :
    "bg-zinc-900 text-zinc-500 border-zinc-800";

  const statusLabel = 
    video.status === "APPROVED" ? "Live" :
    video.status === "PENDING" ? "Pending" :
    "Rejected";

  return (
    <button
      onClick={onClick}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex text-left active:scale-[0.98] transition-all hover:border-zinc-700"
    >
      <div className="w-[72px] h-[88px] bg-zinc-800 flex-shrink-0 relative overflow-hidden">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {cat?.emoji || "🎬"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-white truncate tracking-tight">{video.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-zinc-500" />
            <span className="text-[11px] text-zinc-400 truncate">
              {video.placeName}, {video.district}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
            statusCls
          )}>
            <StatusIcon style={{ width: 10, height: 10 }} />
            {statusLabel}
          </div>
          <span className="text-[10px] text-zinc-500 font-medium">
            {formatRelativeTime(video.createdAt)}
          </span>
        </div>
        {video.status === "REJECTED" && video.rejectionReason && (
          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1 italic">
            "{video.rejectionReason}"
          </p>
        )}
      </div>
    </button>
  );
}

function EmptyVideos({ tab, onUpload }: { tab: VideoTab; onUpload: () => void }) {
  const msgs: Record<VideoTab, { emoji: string; title: string; sub: string }> = {
    all:      { emoji: "🎬", title: "No videos yet",       sub: "Upload your first Karnataka story" },
    PENDING:  { emoji: "⏳", title: "Nothing pending",     sub: "All submissions have been reviewed" },
    APPROVED: { emoji: "✅", title: "No published videos", sub: "Keep uploading — great content gets approved!" },
    REJECTED: { emoji: "✨", title: "No rejections",       sub: "Looking good!" },
  };
  const m = msgs[tab];
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="text-5xl mb-4 opacity-90">{m.emoji}</div>
      <p className="text-sm font-semibold tracking-tight text-white mb-1">{m.title}</p>
      <p className="text-xs text-zinc-500 mb-6">{m.sub}</p>
      {tab === "all" && (
        <button
          onClick={onUpload}
          className="flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-transform active:scale-[0.98]"
        >
          <Camera className="w-4 h-4" />
          Upload now
        </button>
      )}
    </div>
  );
  
}


*/

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, Settings, MapPin, Video, Bookmark,
  Clock, CheckCircle2, XCircle, ChevronRight,
  User, Shield, Camera, Edit3, Route, TrendingUp, Loader2
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { IVideo } from "@/types";
import { CATEGORIES } from "@/constants";
import { formatRelativeTime, cn } from "@/lib/utils";
import { BottomNav } from "@/components/layout/BottomNav";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

type VideoTab = "all" | "PENDING" | "APPROVED" | "REJECTED";

const TAB_LABELS: Record<VideoTab, string> = {
  all: "All", APPROVED: "Live", PENDING: "Pending", REJECTED: "Rejected",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [videos, setVideos]       = useState<IVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<VideoTab>("all");
  const { toasts, removeToast, toast } = useToast();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "CREATOR") fetchMyVideos("all");
  }, [user]);

  const fetchMyVideos = async (tab: VideoTab) => {
    setVideosLoading(true);
    try {
      const url = tab !== "all"
        ? `/api/videos/my-videos?status=${tab}`
        : "/api/videos/my-videos";
      const res  = await fetch(url);
      const data = await res.json();
      if (data.success) setVideos(data.data.videos);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleTabChange = (tab: VideoTab) => {
    setActiveTab(tab);
    fetchMyVideos(tab);
  };

  if (loading || !user) {
    return (
      <div className="h-dvh flex items-center justify-center bg-transparent relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
        <Loader2 className="w-6 h-6 text-white animate-spin z-10" />
      </div>
    );
  }

  const counts: Record<VideoTab, number> = {
    all:      videos.length,
    PENDING:  videos.filter(v => v.status === "PENDING").length,
    APPROVED: videos.filter(v => v.status === "APPROVED").length,
    REJECTED: videos.filter(v => v.status === "REJECTED").length,
  };

  return (
    // 1. Changed bg-black to bg-transparent
    <div className="min-h-dvh bg-transparent pb-28 relative">
      
      
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/80 to-[#0A0A0A] z-0 pointer-events-none" />

      
      <div className="relative z-10">
        
        
        <div className="relative px-4 pt-14 pb-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          
          <div className="flex items-start justify-between mb-5 relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center text-2xl font-bold text-white border-2 border-white/10 shadow-xl">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                {user.role === "CREATOR" && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center">
                    <Camera className="w-3 h-3 text-black" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-tight drop-shadow-md">{user.fullName}</h1>
                <p className="text-xs text-zinc-300 mt-0.5 font-medium drop-shadow-md">
                  @{user.fullName.replace(/\s+/g, "").toLowerCase()}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <RoleBadge role={user.role} />
                  {user.district && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-300 font-medium bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full shadow-sm">
                      <MapPin className="w-2.5 h-2.5" />{user.district}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={logout}
                className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors hover:bg-white/10 shadow-lg"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
              <button
                className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors hover:bg-white/10 shadow-lg"
                title="Edit profile"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          
          {user.role === "CREATOR" && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              <StatCard value={counts.APPROVED} label="Published" color="text-white" />
              <StatCard value={counts.PENDING}  label="Pending" color="text-zinc-300" />
              <StatCard value={counts.REJECTED} label="Rejected" color="text-zinc-400" />
            </div>
          )}

          {user.role === "EXPLORER" && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              <StatCard value={0} label="Saved" color="text-white" />
              <StatCard value={0} label="Trips" color="text-white" />
              <StatCard value={0} label="Explored" color="text-white" />
            </div>
          )}
        </div>

        
        {user.role === "CREATOR" && (
          <div className="px-4 mt-1">
            
            <div className="flex bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-1 mb-4 shadow-xl">
              {(["all", "APPROVED", "PENDING", "REJECTED"] as VideoTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all",
                    activeTab === tab
                      ? "bg-white text-black shadow-md"
                      : "text-zinc-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {TAB_LABELS[tab]}
                  <span className="ml-0.5 opacity-60 font-medium">({counts[tab]})</span>
                </button>
              ))}
            </div>

            {videosLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 skeleton rounded-2xl opacity-50" />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <EmptyVideos tab={activeTab} onUpload={() => router.push("/upload")} />
            ) : (
              <div className="space-y-3">
                {videos.map(video => (
                  <VideoListCard
                    key={video._id}
                    video={video}
                    onClick={() => router.push(`/place/${video._id}`)}
                  />
                ))}
              </div>
            )}

            
            <button
              onClick={() => router.push("/upload")}
              className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-2xl py-4 text-sm font-semibold text-white bg-black/20 hover:bg-black/40 backdrop-blur-md active:scale-[0.98] transition-all shadow-xl"
            >
              <Camera className="w-4 h-4" />
              Upload new story
            </button>
          </div>
        )}

        
        {user.role === "EXPLORER" && (
          <div className="px-4 mt-2 space-y-5">
            <MenuSection title="MY CONTENT">
              <MenuItem icon={Bookmark} label="Saved places"   sub="Bookmarked videos"       onClick={() => router.push("/saved")} />
              <MenuItem icon={Route}    label="My trips"       sub="Planned itineraries"     onClick={() => router.push("/itineraries")} />
              <MenuItem icon={Video}    label="Saved videos"   sub="Videos you bookmarked"   onClick={() => router.push("/saved")} />
            </MenuSection>

            <MenuSection title="DISCOVER">
              <MenuItem icon={TrendingUp} label="Trending"       sub="Most saved places"       onClick={() => router.push("/")} />
              <MenuItem icon={MapPin}     label="Explore ROAM"   sub="Browse the video feed"   onClick={() => router.push("/explore")} />
            </MenuSection>

            <MenuSection title="ACCOUNT">
              <MenuItem icon={Settings} label="Settings" sub="Preferences & notifications"
                onClick={() => toast.info("Settings coming in V2")} />
              <MenuItem icon={LogOut} label="Sign out" sub="Log out of your account"
                onClick={logout} danger />
            </MenuSection>
          </div>
        )}

        
        {user.role === "CREATOR" && (
          <div className="px-4 mt-4 space-y-5">
            <MenuSection title="ACCOUNT">
              <MenuItem icon={Settings} label="Settings" sub="Preferences & notifications"
                onClick={() => toast.info("Settings coming in V2")} />
              <MenuItem icon={LogOut} label="Sign out" sub="Log out of your account"
                onClick={logout} danger />
            </MenuSection>
          </div>
        )}

      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <BottomNav />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, { icon: React.ElementType; label: string; cls: string }> = {
    EXPLORER: { icon: User,   label: "Explorer", cls: "bg-black/50 text-zinc-300 border-white/10" },
    CREATOR:  { icon: Camera, label: "Creator",  cls: "bg-white text-black border-white" },
    ADMIN:    { icon: Shield, label: "Admin",    cls: "bg-black/50 text-zinc-300 border-white/10" },
  };
  const c = cfg[role];
  if (!c) return null;
  return (
    <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md", c.cls)}>
      <c.icon style={{ width: 10, height: 10 }} />
      {c.label}
    </span>
  );
}

// Simplified StatCard to enforce glassmorphism
function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-2xl p-3 text-center border bg-black/40 backdrop-blur-md border-white/10 shadow-lg">
      <div className={cn("text-xl font-bold tracking-tight", color)}>{value}</div>
      <div className="text-[10px] text-zinc-400 mt-0.5 font-medium tracking-wide uppercase">{label}</div>
    </div>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-zinc-400 tracking-widest uppercase mb-2 ml-1 drop-shadow-md">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function MenuItem({
  icon: Icon, label, sub, onClick, danger = false,
}: {
  icon: React.ElementType; label: string; sub: string;
  onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-black/40 backdrop-blur-md rounded-2xl border px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-all text-left shadow-lg",
        "border-white/10 hover:border-white/20 hover:bg-white/5"
      )}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 border border-white/5">
        <Icon
          style={{ width: 18, height: 18 }}
          className={danger ? "text-red-400" : "text-white"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold tracking-tight", danger ? "text-red-400" : "text-white")}>{label}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-zinc-500" />}
    </button>
  );
}

function VideoListCard({ video, onClick }: { video: IVideo; onClick: () => void }) {
  const cat    = CATEGORIES.find(c => c.value === video.category);
  const StatusIcon =
    video.status === "APPROVED" ? CheckCircle2 :
    video.status === "REJECTED" ? XCircle : Clock;
    
  const statusCls = 
    video.status === "APPROVED" ? "bg-white text-black border-white" :
    video.status === "PENDING" ? "bg-black/50 text-zinc-300 border-white/20" :
    "bg-black/50 text-red-400 border-red-500/30";

  const statusLabel = 
    video.status === "APPROVED" ? "Live" :
    video.status === "PENDING" ? "Pending" :
    "Rejected";

  return (
    <button
      onClick={onClick}
      className="w-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl overflow-hidden flex text-left active:scale-[0.98] transition-all hover:border-white/20 hover:bg-white/5"
    >
      <div className="w-[72px] h-[88px] bg-white/5 flex-shrink-0 relative overflow-hidden">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {cat?.emoji || "🎬"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-white truncate tracking-tight drop-shadow-sm">{video.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-zinc-400" />
            <span className="text-[11px] text-zinc-400 truncate">
              {video.placeName}, {video.district}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md",
            statusCls
          )}>
            <StatusIcon style={{ width: 10, height: 10 }} />
            {statusLabel}
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">
            {formatRelativeTime(video.createdAt)}
          </span>
        </div>
        {video.status === "REJECTED" && video.rejectionReason && (
          <p className="text-[10px] text-red-400 mt-1 line-clamp-1 italic font-medium drop-shadow-sm">
            "{video.rejectionReason}"
          </p>
        )}
      </div>
    </button>
  );
}

function EmptyVideos({ tab, onUpload }: { tab: VideoTab; onUpload: () => void }) {
  const msgs: Record<VideoTab, { emoji: string; title: string; sub: string }> = {
    all:      { emoji: "🎬", title: "No videos yet",       sub: "Upload your first Karnataka story" },
    PENDING:  { emoji: "⏳", title: "Nothing pending",     sub: "All submissions have been reviewed" },
    APPROVED: { emoji: "✅", title: "No published videos", sub: "Keep uploading — great content gets approved!" },
    REJECTED: { emoji: "✨", title: "No rejections",       sub: "Looking good!" },
  };
  const m = msgs[tab];
  return (
    <div className="py-12 flex flex-col items-center text-center bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl">
      <div className="text-5xl mb-4 opacity-90">{m.emoji}</div>
      <p className="text-sm font-semibold tracking-tight text-white mb-1 drop-shadow-md">{m.title}</p>
      <p className="text-xs text-zinc-400 mb-6 drop-shadow-md">{m.sub}</p>
      {tab === "all" && (
        <button
          onClick={onUpload}
          className="flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-transform active:scale-[0.98] shadow-xl"
        >
          <Camera className="w-4 h-4" />
          Upload now
        </button>
      )}
    </div>
  );
}


