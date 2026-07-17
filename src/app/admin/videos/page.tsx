/*
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, Trash2, Play, MapPin,
  User, Calendar, ChevronDown, ChevronUp, Loader2,
  Eye
} from "lucide-react";
import { IVideo } from "@/types";
import { CATEGORIES, VIDEO_STATUS } from "@/constants";
import { formatRelativeTime, cn } from "@/lib/utils";

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED";

function AdminVideosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = (searchParams.get("status") as StatusFilter) || "PENDING";

  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVideos = useCallback(async (s: StatusFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos?status=${s}`);
      const data = await res.json();
      if (data.success) setVideos(data.data.videos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVideos(status); }, [status, fetchVideos]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/videos/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        showToast("Video approved and published!", "ok");
      } else {
        showToast(data.error || "Failed", "err");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { showToast("Please enter a rejection reason", "err"); return; }
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/videos/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        setRejectingId(null);
        setRejectReason("");
        showToast("Video rejected", "ok");
      } else {
        showToast(data.error || "Failed", "err");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video permanently?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        showToast("Video deleted", "ok");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const STATUS_TABS: StatusFilter[] = ["PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="pb-6">
      {/* Toast *}
      {toast && (
        <div className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl text-sm font-medium shadow-xl max-w-[calc(430px-32px)] w-full",
          toast.type === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        )}>
          {toast.msg}
        </div>
      )}

      {/* Status tabs *}
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-lg font-bold text-white mb-4">Video moderation</h2>
        <div className="flex bg-[#0f172a] rounded-2xl p-1 gap-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); router.replace(`/admin/videos?status=${s}`); }}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
                status === s ? "bg-[#1e40af] text-white" : "text-[#475569]"
              )}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Count *}
      {!loading && (
        <p className="px-4 text-xs text-[#475569] mb-3">
          {videos.length} video{videos.length !== 1 ? "s" : ""} · {VIDEO_STATUS[status].label}
        </p>
      )}

      {/* List *}
      <div className="px-4 space-y-3">
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 skeleton rounded-2xl" />
            ))}
          </>
        )}

        {!loading && videos.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">
              {status === "PENDING" ? "✅" : status === "APPROVED" ? "🎬" : "🗑"}
            </div>
            <p className="text-sm font-semibold text-white">
              {status === "PENDING" ? "All caught up!" : `No ${status.toLowerCase()} videos`}
            </p>
            <p className="text-xs text-[#475569] mt-1">
              {status === "PENDING" ? "No videos waiting for review" : "Nothing to show here"}
            </p>
          </div>
        )}

        {videos.map((video) => {
          const isExpanded = expandedId === video._id;
          const isActioning = actionLoading === video._id;
          const isRejecting = rejectingId === video._id;
          const cat = CATEGORIES.find((c) => c.value === video.category);
          const creator = typeof video.creatorId === "object" ? video.creatorId as { fullName: string; email: string } : null;

          return (
            <div key={video._id} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
              {/* Video preview row *}
              <div className="flex gap-3 p-3">
                <div className="w-20 h-24 rounded-xl bg-[#1e293b] flex-shrink-0 overflow-hidden relative">
                  {video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-[#334155]" />
                    </div>
                  )}
                  {cat && (
                    <div className="absolute bottom-1 left-1 text-xs bg-black/60 rounded px-1">{cat.emoji}</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{video.title}</p>

                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-[#475569]" />
                    <span className="text-xs text-[#64748b] truncate">{creator?.fullName || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#475569]" />
                    <span className="text-xs text-[#64748b] truncate">{video.placeName}, {video.district}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#475569]" />
                    <span className="text-xs text-[#64748b]">{formatRelativeTime(video.createdAt)}</span>
                  </div>
                  {video.status === "REJECTED" && video.rejectionReason && (
                    <p className="text-[10px] text-rose-400 mt-1 line-clamp-1">Reason: {video.rejectionReason}</p>
                  )}
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : video._id)}
                  className="self-start mt-1 w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center"
                >
                  {isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-[#64748b]" />
                    : <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
                  }
                </button>
              </div>

              {/* Expanded details *}
              {isExpanded && (
                <div className="border-t border-[#1e293b] px-3 py-3 space-y-2">
                  <p className="text-xs text-[#64748b] leading-relaxed">{video.description}</p>
                  {video.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-[#1e293b] text-[#64748b] px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {creator && (
                    <p className="text-[10px] text-[#475569]">Creator email: {creator.email}</p>
                  )}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#60a5fa] underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview video
                  </a>
                </div>
              )}

              {/* Reject reason input *}
              {isRejecting && (
                <div className="border-t border-[#1e293b] px-3 py-3">
                  <p className="text-xs font-medium text-[#94a3b8] mb-2">Rejection reason (required)</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Video quality too low, incorrect location..."
                    rows={2}
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white placeholder-[#475569] resize-none focus:border-rose-500 transition-all"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleReject(video._id)}
                      disabled={isActioning}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Confirm reject
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason(""); }}
                      className="px-4 bg-[#1e293b] text-[#64748b] text-xs font-medium py-2.5 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons *}
              {!isRejecting && (
                <div className="border-t border-[#1e293b] flex">
                  {status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApprove(video._id)}
                        disabled={isActioning}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-60 border-r border-[#1e293b]"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => { setRejectingId(video._id); setExpandedId(video._id); }}
                        disabled={isActioning}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-60 border-r border-[#1e293b]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(video._id)}
                    disabled={isActioning}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#475569] hover:bg-rose-500/10 hover:text-rose-400 transition-all disabled:opacity-60",
                      status === "PENDING" ? "px-5" : "flex-1"
                    )}
                  >
                    {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {status !== "PENDING" && "Delete"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminVideosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#60a5fa] animate-spin" />
      </div>
    }>
      <AdminVideosContent />
    </Suspense>
  );
}
*/

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, Trash2, Play, MapPin,
  User, Calendar, ChevronDown, ChevronUp, Loader2,
  Eye
} from "lucide-react";
import { IVideo } from "@/types";
import { CATEGORIES, VIDEO_STATUS } from "@/constants";
import { formatRelativeTime, cn } from "@/lib/utils";

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED";

function AdminVideosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = (searchParams.get("status") as StatusFilter) || "PENDING";

  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVideos = useCallback(async (s: StatusFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/videos?status=${s}`);
      const data = await res.json();
      if (data.success) setVideos(data.data.videos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVideos(status); }, [status, fetchVideos]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/videos/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        showToast("Video approved and published!", "ok");
      } else {
        showToast(data.error || "Failed", "err");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { showToast("Please enter a rejection reason", "err"); return; }
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/videos/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        setRejectingId(null);
        setRejectReason("");
        showToast("Video rejected", "ok");
      } else {
        showToast(data.error || "Failed", "err");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video permanently?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        showToast("Video deleted", "ok");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const STATUS_TABS: StatusFilter[] = ["PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="relative min-h-dvh pb-6">
      {/* Dark gradient overlay matching the Login Page */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95 z-0 pointer-events-none" />

      <div className="relative z-10">
        {/* Toast */}
        {toast && (
          <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl max-w-[calc(430px-32px)] w-full text-center transition-all",
            toast.type === "ok" 
              ? "bg-white text-black border border-white" 
              : "bg-zinc-900 text-white border border-white/20 backdrop-blur-md"
          )}>
            {toast.msg}
          </div>
        )}

        {/* Status tabs */}
        <div className="px-4 pt-5 pb-3">
          <h2 className="text-lg font-bold text-white mb-4 drop-shadow-md">Video moderation</h2>
          <div className="flex bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-1 shadow-lg">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); router.replace(`/admin/videos?status=${s}`); }}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
                  status === s 
                    ? "bg-white text-black shadow-md" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p className="px-4 text-xs text-zinc-400 mb-3 drop-shadow-md font-medium">
            {videos.length} video{videos.length !== 1 ? "s" : ""} · {VIDEO_STATUS[status].label}
          </p>
        )}

        {/* List */}
        <div className="px-4 space-y-3">
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 skeleton rounded-2xl opacity-50" />
              ))}
            </>
          )}

          {!loading && videos.length === 0 && (
            <div className="py-16 text-center bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl">
              <div className="text-4xl mb-3 opacity-90 grayscale">
                {status === "PENDING" ? "☑️" : status === "APPROVED" ? "🎬" : "🗑"}
              </div>
              <p className="text-sm font-semibold text-white drop-shadow-md">
                {status === "PENDING" ? "All caught up!" : `No ${status.toLowerCase()} videos`}
              </p>
            </div>
          )}

{/*

          {videos.map((video) => {
            const isExpanded = expandedId === video._id;
            const isActioning = actionLoading === video._id;
            const isRejecting = rejectingId === video._id;
            const cat = CATEGORIES.find((c) => c.value === video.category);
            const creator = typeof video.creatorId === "object" ? video.creatorId as { fullName: string; email: string } : null;

            return (
              <div key={video._id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-white/20">
                <div className="flex gap-3 p-3">
                  <div className="w-20 h-24 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden relative border border-white/5">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-zinc-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-snug line-clamp-2 drop-shadow-sm">{video.title}</p>
                    <div className="flex items-center gap-1 mt-1"><User className="w-3 h-3 text-zinc-400" /><span className="text-xs text-zinc-400 truncate">{creator?.fullName || "Unknown"}</span></div>
                    <div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-zinc-400" /><span className="text-xs text-zinc-400 truncate">{video.placeName}</span></div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : video._id)}
                    className="self-start mt-1 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-white" /> : <ChevronDown className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 px-3 py-3 space-y-2 bg-white/5">
                    <p className="text-xs text-zinc-300 leading-relaxed">{video.description}</p>
                    <a href={video.videoUrl} target="_blank" className="flex items-center gap-1.5 text-xs text-white underline font-medium">
                      <Eye className="w-3.5 h-3.5" /> Preview video
                    </a>
                  </div>
                )}

                
                {!isRejecting && (
                  <div className="border-t border-white/10 flex">
                    {status === "PENDING" && (
                      <>
                        <button onClick={() => handleApprove(video._id)} className="flex-1 py-3 text-xs font-semibold text-white hover:bg-white/10 border-r border-white/10">Approve</button>
                        <button onClick={() => { setRejectingId(video._id); setExpandedId(video._id); }} className="flex-1 py-3 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 border-r border-white/10">Reject</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(video._id)} className="flex items-center justify-center flex-1 py-3 text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white">Delete</button>
                  </div>
                )}
              </div>
            );
          })}

          */}
          {videos.map((video) => {
            const isExpanded = expandedId === video._id;
            const cat = CATEGORIES.find((c) => c.value === video.category);
            const creator = typeof video.uploadedBy === "object" ? (video.uploadedBy as any) : null;
            
            // FIX: Safely get place data from populated placeId
            const place = typeof video.placeId === "object" ? (video.placeId as any) : null;
            const placeName = place?.name || video.placeName || "Unknown Place";
            const district = place?.district || video.district || "Unknown District";

            return (
              <div key={video._id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-white/20">
                <div className="flex gap-3 p-3">
                  <div className="w-20 h-24 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden relative border border-white/5">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-zinc-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{video.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs text-zinc-400 truncate">{creator?.fullName || "Unknown Creator"}</span>
                    </div>
                    {/* FIXED: Now displays actual place name and district */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs text-zinc-400 truncate">{placeName}, {district}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : video._id)}
                    className="self-start mt-1 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-white" /> : <ChevronDown className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 px-3 py-3 space-y-3 bg-white/5">
                    <p className="text-xs text-zinc-300 leading-relaxed">{video.description}</p>
                    
                    {/* FIXED: Ensure video.url is used correctly */}
                    {video.url ? (
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-white underline font-medium"
                      >
                        <Play className="w-3.5 h-3.5" /> Preview Video
                      </a>
                    ) : (
                      <p className="text-xs text-red-400">Video source missing</p>
                    )}

                    {/* Rejection input area */}
                    {rejectingId === video._id && (
                      <div className="pt-2">
                        <textarea
                          placeholder="Reason for rejection..."
                          className="w-full bg-black/60 border border-white/20 rounded-xl p-2 text-xs text-white"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleReject(video._id)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Confirm Reject</button>
                          <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 bg-zinc-700 text-white text-xs font-bold rounded-lg">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
        </div>
      </div>
    </div>
  );
}

export default function AdminVideosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}>
      <AdminVideosContent />
    </Suspense>
  );
}