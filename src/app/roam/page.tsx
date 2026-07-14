/*
import RoamFeed from '@/components/RoamFeed';

export const metadata = {
  title: 'Roam - Discover Locations',
};

export default function RoamPage() {
  return (
    <main className="bg-black min-h-screen">
      <RoamFeed />
    </main>
  );
}
*/


import RoamFeed from '@/components/RoamFeed';

export const metadata = {
  title: 'Roam - Discover Locations',
};

export default function RoamPage() {
  return (
    <main className="relative min-h-dvh scenery-bg">
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      <RoamFeed />
    </main>
  );
}