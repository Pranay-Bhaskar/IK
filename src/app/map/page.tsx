/*
import MapPageClient from "@/features/map/MapPageClient";
import { Suspense } from "react";

export const metadata = {
  title: 'Map - Location Explorer',
};

export default function MapPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* 
        We use Suspense because MapPageClient uses useSearchParams(). 
        Next.js requires Suspense boundaries for search params in production. 
      *}
      <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-white">Loading Map...</div>}>
        <MapPageClient />
      </Suspense>
    </main>
  );
}
*/



import MapPageClient from "@/features/map/MapPageClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: 'Map - Location Explorer',
};

export default function MapPage() {
  return (
    <main className="relative min-h-dvh scenery-bg">
      {/* 
        We use Suspense because MapPageClient uses useSearchParams(). 
        Next.js requires Suspense boundaries for search params in production. 
      */}
      <Suspense 
        fallback={
          <div className="relative min-h-dvh scenery-bg">
      {/* ── Cinematic Overlay ── */}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />
            
            {/* Glassmorphic Loader */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-2xl">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] animate-pulse">
                Loading Map...
              </p>
            </div>
          </div>
        }
      >
        <MapPageClient />
      </Suspense>
    </main>
  );
}