'use client';

import React, { useEffect, useRef, useState } from 'react';
import PlaceGallery from './PlaceGallery';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  useEffect(() => {
    // Basic fetch of all places
    const fetchPlaces = async () => {
      try {
        const res = await fetch('/api/places?limit=100'); // Might need bounding box logic for production
        const data = await res.json();
        if (data.success) {
          setPlaces(data.places);
        }
      } catch (err) {
        console.error('Failed to fetch places for map', err);
      }
    };
    fetchPlaces();
  }, []);

  useEffect(() => {
    // Only initialize map once the script is loaded (assuming it's added via next/script in layout)
    if (typeof window !== 'undefined' && window.google && !map && mapRef.current) {
      const initialMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.9716, lng: 77.5946 }, // Default Bangalore
        zoom: 12,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          // Add more dark mode styles as needed...
        ],
        disableDefaultUI: true,
      });
      setMap(initialMap);
    }
  }, [mapRef, map]);

  useEffect(() => {
    if (map && places.length > 0) {
      // Clear existing markers if we had any logic to store them
      // For now, simple marker creation
      places.forEach(place => {
        if (place.location && place.location.coordinates) {
          const marker = new window.google.maps.Marker({
            position: { 
              lat: place.location.coordinates[1], 
              lng: place.location.coordinates[0] 
            },
            map,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' // Or custom icon
            }
          });

          marker.addListener('click', () => {
            setSelectedPlace(place);
          });
        }
      });
    }
  }, [map, places]);

  return (
    <div className="w-full h-[100dvh] relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading overlay for Map Script */}
      {!map && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-white">
          Loading Map... (Ensure Google Maps API key is provided)
        </div>
      )}

      {selectedPlace && (
        <PlaceGallery 
          placeId={selectedPlace._id} 
          placeName={selectedPlace.name} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}
    </div>
  );
}
