"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function EditVideoPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="min-h-dvh scenery-bg p-4 pt-14 text-white">
      <button onClick={() => router.back()} className="flex items-center gap-2 font-black text-sm mb-6 hover:opacity-70">
        <ArrowLeft className="w-4 h-4" /> Back to Review
      </button>
      
      <h1 className="text-2xl font-black mb-6">Edit Video Details</h1>
      <p>Edit video</p>
      {/* Your form will go here later */}
    </div>
  );
}