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
      */}
      <Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-white">Loading Map...</div>}>
        <MapPageClient />
      </Suspense>
    </main>
  );
}