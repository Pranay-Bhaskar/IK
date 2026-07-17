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
        {/* Left: Video Preview */}
        <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {video.sourceType === "youtube" ? (
            <iframe src={`https://www.youtube.com/embed/${video.youtubeVideoId}`} className="w-full h-full" />
          ) : (
            <video src={video.url} controls className="w-full h-full object-cover" />
          )}
        </div>

        {/* Right: Info & Status */}
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