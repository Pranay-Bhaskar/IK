import MapView from '@/components/MapView';
import Script from 'next/script';

export const metadata = {
  title: 'Map - Location Explorer',
};

export default function MapPage() {
  return (
    <main className="bg-black min-h-screen">
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        strategy="beforeInteractive" 
      />
      <MapView />
    </main>
  );
}