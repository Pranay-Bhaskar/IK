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
