/*
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, CheckCircle2, Clock, XCircle, 
  AlertCircle, Edit3, Trash2, Loader2 
} from "lucide-react";
import { IVideo } from "@/types";
import { VIDEO_STATUS } from "@/constants";
import { formatRelativeTime, cn } from "@/lib/utils";

export default function VideoReviewPage() {
  const router = useRouter();
  const { id } = useParams();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/videos/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVideo(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-dvh flex items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>;
  if (!video) return <div className="text-white p-10">Video not found</div>;

  const status = VIDEO_STATUS[video.status];

  return (
    <div className="min-h-dvh scenery-bg p-4 pt-14">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-white font-black text-sm mb-6 hover:opacity-70">
        <ArrowLeft className="w-4 h-4" /> Back to Content
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {video.sourceType === "youtube" ? (
            <iframe src={`https://www.youtube.com/embed/${video.youtubeVideoId}`} className="w-full h-full" />
          ) : (
            <video src={video.url} controls className="w-full h-full object-cover" />
          )}
        </div>

        
        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
            <h1 className="text-2xl font-black text-white mb-2">{video.title}</h1>
            <p className="text-zinc-400 text-sm mb-4">{video.description}</p>
            
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border", status.bg, status.color)}>
              {video.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4" /> : 
               video.status === "REJECTED" ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              <span className="font-black uppercase tracking-wider text-xs">{status.label}</span>
            </div>
          </div>

          {video.status === "REJECTED" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-2 text-red-400 font-black mb-2">
                <AlertCircle className="w-5 h-5" /> REJECTION REASON
              </div>
              <p className="text-red-200 text-sm italic">"{video.rejectionReason || "No reason provided."}"</p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit Details
            </button>
            <button className="bg-black/40 border border-white/10 text-white font-black px-6 py-4 rounded-2xl">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

*/




//NEW



"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, CheckCircle2, Clock, XCircle, 
  AlertCircle, Edit3, Trash2, Loader2 
} from "lucide-react";
import { IVideo } from "@/types";
import { cn } from "@/lib/utils";

export default function VideoReviewPage() {
  const router = useRouter();
  const { id } = useParams();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/videos/my-videos/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVideo(d.data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white w-8 h-8" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-black text-white p-10">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-black">Video not found</h1>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-white/10 rounded-full font-bold">
          Go Back
        </button>
      </div>
    );
  }

  // SAFE STATUS FALLBACKS (No reading from undefined objects)
  const StatusIcon = video.status === "APPROVED" ? CheckCircle2 : video.status === "REJECTED" ? XCircle : Clock;
  const statusLabel = video.status === "APPROVED" ? "Live" : video.status === "PENDING" ? "Pending" : "Rejected";
  const statusCls = video.status === "APPROVED" 
    ? "bg-white text-black border-white" 
    : video.status === "PENDING" 
      ? "bg-black/50 text-zinc-300 border-white/20" 
      : "bg-black/50 text-red-400 border-red-500/30";

  return (
    <div className="min-h-dvh scenery-bg p-4 pt-14">
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />
      
      <div className="relative z-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white font-black text-sm mb-6 hover:opacity-70">
          <ArrowLeft className="w-4 h-4" /> Back to Content
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Video Preview */}
          <div className="aspect-[9/16] bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
            {video.sourceType === "youtube" ? (
              <iframe src={`https://www.youtube.com/embed/${video.youtubeVideoId}`} className="w-full h-full" />
            ) : (
              <video src={video.url} controls className="w-full max-h-full object-contain" />
            )}
          </div>

          {/* Right: Info & Status */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
              <h1 className="text-2xl font-black text-white mb-2">{video.title}</h1>
              <p className="text-zinc-400 text-sm mb-4">{video.description}</p>
              
              {/* FIX: Using the safe statusCls string here */}
              <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border", statusCls)}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-black uppercase tracking-wider text-xs">{statusLabel}</span>
              </div>
            </div>

            {video.status === "REJECTED" && (
              <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-red-400 font-black mb-2">
                  <AlertCircle className="w-5 h-5" /> REJECTION REASON
                </div>
                <p className="text-red-200 text-sm italic">"{video.rejectionReason || "No specific reason provided by the admin."}"</p>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all">
                <Edit3 className="w-4 h-4" /> Edit Details
              </button>
              <button className="bg-black/40 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white hover:text-red-400 font-black px-6 py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}