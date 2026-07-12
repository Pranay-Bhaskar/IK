/*

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
          // Replace your marker logic with this high-contrast SVG pin
          const icon = {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
            fillColor: "#7c3aed", // Your primary purple
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 24),
          };

          const marker = new window.google.maps.Marker({
            position: { lat: place.location.coordinates[1], lng: place.location.coordinates[0] },
            map,
            icon: icon, // Using the cleaner SVG icon
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
      
      {/* Loading overlay for Map Script *}
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

*/



"use client";

import React, { useEffect, useRef, useState } from 'react';
import PlaceGallery from './PlaceGallery';
import { MapFilterPanel } from "@/features/map/MapFilterPanel"; 
import { GeolocationButton } from "@/features/map/GeolocationButton"; 
import { useGeolocation } from "@/features/map/useGeolocation"; 

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  // --- ADDED STATE & HOOKS ---
  const [activeCategory, setCategory] = useState<any>("");
  // Updated (Matches the hook's interface)
  const { permissionState, requesting, coords, requestLocation } = useGeolocation();
  // ---------------------------

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch('/api/places?limit=100');
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
    if (typeof window !== 'undefined' && window.google && !map && mapRef.current) {
      const initialMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 12,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0d0d16" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#555577" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d16" }] },
          { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1e1e2e" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#161622" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0a0f" }] }
        ],
        disableDefaultUI: true,
      });
      setMap(initialMap);
    }
  }, [mapRef, map]);

  return (
    <div className="w-full h-[100dvh] relative bg-[#0d0d16]">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* HUD Filter Overlay */}
      <div className="absolute top-14 left-0 right-0 z-10 px-4">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
          <MapFilterPanel 
            activeCategory={activeCategory} 
            onChange={setCategory} 
          />
        </div>
      </div>

      {/* Location Button */}
      <div className="absolute bottom-24 right-4 z-10">
        <GeolocationButton 
          permissionState={permissionState}
          requesting={requesting}
          hasCoords={!!coords}
          onClick={requestLocation}
        />
      </div>

      {/* Gallery Overlay */}
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


