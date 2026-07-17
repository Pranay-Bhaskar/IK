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
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function VideoReviewPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toasts, removeToast, toast } = useToast();
  
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/videos/my-videos/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVideo(d.data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEdit = () => {
    // Routes to your edit page (You will need to create app/creator/edit/[id]/page.tsx)
    router.push(`/creator/edit/${video?._id}`);
  };

  const handleDelete = async () => {
    if (!video?._id) return;
    
    // Safety confirmation before deleting
    const confirmed = window.confirm("Are you sure you want to delete this video? This action cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/videos/${video._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Video deleted successfully");
        // Wait a brief moment for the user to see the success toast, then route back
        setTimeout(() => {
          router.push("/creator/content");
        }, 1000);
      } else {
        toast.error(data.error || "Failed to delete video");
        setIsDeleting(false);
      }
    } catch (err) {
      toast.error("An error occurred while deleting");
      setIsDeleting(false);
    }
  };

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

  // SAFE STATUS FALLBACKS
  const StatusIcon = video.status === "APPROVED" ? CheckCircle2 : video.status === "REJECTED" ? XCircle : Clock;
  const statusLabel = video.status === "APPROVED" ? "Live" : video.status === "PENDING" ? "Pending" : "Rejected";
  const statusCls = video.status === "APPROVED" 
    ? "bg-white text-black border-white" 
    : video.status === "PENDING" 
      ? "bg-black/50 text-zinc-300 border-white/20" 
      : "bg-black/50 text-red-400 border-red-500/30";

  return (
    <div className="min-h-dvh scenery-bg p-4 pt-14 flex flex-col">
      <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none" />
      
      <div className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white font-black text-sm mb-5 hover:opacity-70 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Content
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
          {/* Left: Video Preview */}
          <div className="aspect-[9/16] lg:aspect-auto lg:h-full bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
            {video.sourceType === "youtube" ? (
              <iframe src={`https://www.youtube.com/embed/${video.youtubeVideoId}`} className="w-full h-full" />
            ) : (
              <video src={video.url} controls className="w-full max-h-full object-contain" />
            )}
          </div>

          {/* Right: Info & Status */}
          <div className="space-y-4 flex flex-col">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
              <h1 className="text-xl font-black text-white mb-1.5">{video.title}</h1>
              <p className="text-zinc-400 text-xs mb-4 line-clamp-3">{video.description}</p>
              
              <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border", statusCls)}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span className="font-black uppercase tracking-wider text-[10px]">{statusLabel}</span>
              </div>
            </div>

            {video.status === "REJECTED" && (
              <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-2 text-red-400 font-black mb-1.5 text-sm">
                  <AlertCircle className="w-4 h-4" /> REJECTION REASON
                </div>
                <p className="text-red-200 text-xs italic leading-relaxed">
                  "{video.rejectionReason || "No specific reason provided by the admin."}"
                </p>
              </div>
            )}

            <div className="mt-auto pt-4 flex gap-2.5">
              {/* Refined Edit Button */}
              <button 
                onClick={handleEdit}
                className="flex-1 bg-white hover:bg-zinc-200 text-black text-sm font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
              >
                <Edit3 className="w-4 h-4" /> Edit Details
              </button>
              
              {/* Refined Delete Button */}
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-black/40 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 font-black px-5 py-3 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}