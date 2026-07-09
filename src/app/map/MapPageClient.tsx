"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MapView, type MapViewHandle } from "@/features/map/MapView";
import { MapFilterPanel } from "@/features/map/MapFilterPanel";
import { MapSearchBar } from "@/features/map/MapSearchBar";
import { GeolocationButton } from "@/features/map/GeolocationButton";
import { PlaceBottomSheet } from "@/features/map/PlaceBottomSheet";
import { useGoogleMaps } from "@/features/map/useGoogleMaps";
import { useGeolocation } from "@/features/map/useGeolocation";
import { usePlaces } from "@/features/map/usePlaces";
import type { IPlace, PlaceCategory, IVideo } from "@/types";

export default function MapPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlaceId = searchParams.get("placeId");

  const [category, setCategory] = useState<PlaceCategory | "">("");
  const [selectedPlace, setSelectedPlace] = useState<IPlace | null>(null);

  const mapRef = useRef<MapViewHandle>(null);
  const initialPlaceSet = useRef(false);

  const { isLoaded, loadError } = useGoogleMaps({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const { coords, permissionState, requesting, requestLocation } = useGeolocation();
  const { places, fetchByBounds } = usePlaces({ category });

  useEffect(() => {
    if (!isLoaded || !initialPlaceId || places.length === 0 || initialPlaceSet.current) return;

    const place = places.find((p) => p._id === initialPlaceId);
    if (!place) return;

    initialPlaceSet.current = true;
    setSelectedPlace(place);

    const [lng, lat] = place.location.coordinates;
    const t = window.setTimeout(() => {
      mapRef.current?.panTo(lat, lng, 16);
    }, 500);

    return () => window.clearTimeout(t);
  }, [isLoaded, initialPlaceId, places]);

  const handleSelectPlace = useCallback((place: IPlace) => {
    setSelectedPlace(place);
    const [lng, lat] = place.location.coordinates;
    mapRef.current?.panTo(lat, lng, 15);
  }, []);

  const handleLocationClick = useCallback(() => {
    if (permissionState === "prompt" || permissionState === "denied") {
      requestLocation();
    } else if (coords) {
      mapRef.current?.panTo(coords.lat, coords.lng, 14);
    }
  }, [permissionState, requestLocation, coords]);

  const openInMaps = useCallback((place: IPlace) => {
    const [lng, lat] = place.location.coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  }, []);

  const watchVideos = useCallback(
    (video: IVideo) => {
      router.push(`/place/${video._id}`);
    },
    [router]
  );

  return (
    <div className="relative w-full h-[calc(100dvh-70px)] bg-[#0a0a0f] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="absolute inset-0 h-40 bg-gradient-to-b from-black/60 to-transparent -z-10" />

        <div className="pt-12 px-4 pointer-events-auto space-y-4">
          <MapSearchBar places={places} onSelectPlace={handleSelectPlace} />
          <MapFilterPanel activeCategory={category} onChange={setCategory} />
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        {!isLoaded && !loadError && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
            </div>
            <p className="text-sm text-white/40 font-semibold tracking-wide">LOADING MAPS...</p>
          </div>
        )}

        {loadError && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center">
            <div className="text-3xl mb-4">🗺️</div>
            <p className="text-sm text-red-400 font-semibold mb-2">Google Maps failed to load</p>
            <p className="text-xs text-white/40">Please check your API key in .env.local</p>
          </div>
        )}

        {isLoaded && (
          <MapView
            ref={mapRef}
            isLoaded={isLoaded}
            places={places}
            selectedPlace={selectedPlace}
            userCoords={coords}
            onMarkerClick={handleSelectPlace}
            onBoundsChange={fetchByBounds}
          />
        )}
      </div>

      <div className="absolute bottom-6 right-4 z-20 pointer-events-auto">
        <GeolocationButton
          permissionState={permissionState}
          requesting={requesting}
          hasCoords={!!coords}
          onClick={handleLocationClick}
        />
      </div>

      <PlaceBottomSheet
        place={selectedPlace}
        userCoords={coords}
        onClose={() => setSelectedPlace(null)}
        onOpenInMaps={openInMaps}
        onWatchVideos={watchVideos}
      />

      <BottomNav />
    </div>
  );
}