"use client";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { DARK_MAP_STYLES, KARNATAKA_CENTER, DEFAULT_ZOOM } from "./constants";
import type { IPlace } from "@/types";
import type { Coords } from "./useGeolocation";

export interface MapViewHandle {
  panTo: (lat: number, lng: number, zoom?: number) => void;
  getMap: () => google.maps.Map | null;
}

interface MapViewProps {
  isLoaded: boolean;
  places: IPlace[];
  selectedPlace: IPlace | null;
  userCoords: Coords | null;
  onMarkerClick: (place: IPlace) => void;
  onBoundsChange?: (bounds: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  }) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  RESTAURANT: "#ef4444",
  CAFE: "#f59e0b",
  "STREET FOOD": "#f97316",
  BAR: "#8b5cf6",
  NATURE: "#22c55e",
  HERITAGE: "#eab308",
  TEMPLE: "#ec4899",
  BEACH: "#06b6d4",
  WILDLIFE: "#84cc16",
  OTHER: "#6b7280",
};

const CATEGORY_EMOJI: Record<string, string> = {
  RESTAURANT: "🍽",
  CAFE: "☕",
  "STREET FOOD": "🌮",
  BAR: "🍺",
  NATURE: "🌿",
  HERITAGE: "🏛",
  TEMPLE: "🛕",
  BEACH: "🏖",
  WILDLIFE: "🐘",
  OTHER: "📍",
};

function createMarkerElement(place: IPlace, isSelected: boolean): HTMLElement {
  const color = CATEGORY_COLORS[place.category || "OTHER"] || "#6b7280";
  const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";
  const scale = isSelected ? 1.25 : 1;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    transform: scale(${scale});
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    will-change: transform;
  `;

  const pin = document.createElement("div");
  pin.style.cssText = `
    width: 36px;
    height: 36px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px ${color}55;
    border: 2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.4)"};
  `;

  const inner = document.createElement("span");
  inner.style.cssText = "transform: rotate(45deg); font-size: 14px; line-height: 1;";
  inner.textContent = emoji;
  pin.appendChild(inner);

  const tip = document.createElement("div");
  tip.style.cssText = `
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid ${color};
    margin-top: -1px;
    filter: drop-shadow(0 2px 4px ${color}44);
  `;

  wrapper.appendChild(pin);
  wrapper.appendChild(tip);
  return wrapper;
}

function createUserMarker(): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position: relative; display: flex; align-items: center; justify-content: center;";

  const pulse = document.createElement("div");
  pulse.style.cssText = `
    position: absolute;
    width: 40px;
    height: 40px;
    background: rgba(59,130,246,0.25);
    border-radius: 50%;
    animation: userPulse 2s ease-in-out infinite;
  `;

  const dot = document.createElement("div");
  dot.style.cssText = `
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(59,130,246,0.6);
    position: relative;
    z-index: 1;
  `;

  wrapper.appendChild(pulse);
  wrapper.appendChild(dot);
  return wrapper;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { isLoaded, places, selectedPlace, userCoords, onMarkerClick, onBoundsChange },
  ref
) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const clustererRef = useRef<import("@googlemaps/markerclusterer").MarkerClusterer | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const selectedIdRef = useRef<string | null>(null);
  const lastBoundsKeyRef = useRef<string>("");

  useImperativeHandle(ref, () => ({
    panTo(lat: number, lng: number, zoom = 15) {
      if (!mapRef.current) return;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(zoom);
    },
    getMap() {
      return mapRef.current;
    },
  }));

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!isLoaded || !mapDivRef.current || mapRef.current) return;
      if (!window.google?.maps?.importLibrary) return;

      const { Map } = (await window.google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      await window.google.maps.importLibrary("marker");

      if (cancelled || !mapDivRef.current || mapRef.current) return;

      const map = new Map(mapDivRef.current, {
        center: KARNATAKA_CENTER,
        zoom: DEFAULT_ZOOM,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        styles: DARK_MAP_STYLES,
        mapTypeId: "roadmap",
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
      });

      mapRef.current = map;

      const idleListener = map.addListener("idle", () => {
        if (!onBoundsChange) return;
        const b = map.getBounds();
        if (!b) return;

        const sw = b.getSouthWest();
        const ne = b.getNorthEast();
        const key = [
          sw.lat().toFixed(4),
          sw.lng().toFixed(4),
          ne.lat().toFixed(4),
          ne.lng().toFixed(4),
        ].join(",");

        if (key === lastBoundsKeyRef.current) return;
        lastBoundsKeyRef.current = key;

        onBoundsChange({
          swLat: sw.lat(),
          swLng: sw.lng(),
          neLat: ne.lat(),
          neLng: ne.lng(),
        });
      });

      listenersRef.current.push(idleListener);
    }

    initMap();

    return () => {
      cancelled = true;
      listenersRef.current.forEach((l) => l.remove());
      listenersRef.current = [];
    };
  }, [isLoaded, onBoundsChange]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current.clear();

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
  }, []);

  const rebuildMarkers = useCallback(async () => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.marker) return;
    const map = mapRef.current;

    clearMarkers();

    const { MarkerClusterer } = await import("@googlemaps/markerclusterer");
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    // DEFENSIVE FIX: Provide an empty array fallback
    const safePlaces = places || [];

    for (const place of safePlaces) {
      const [lng, lat] = place.location.coordinates;
      const isSelected = selectedIdRef.current === place._id;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: createMarkerElement(place, isSelected),
        title: place.name,
        zIndex: isSelected ? 999 : undefined,
      });

      marker.addListener("click", () => {
        selectedIdRef.current = place._id;

        markersRef.current.forEach((m, id) => {
          // DEFENSIVE FIX: Use safePlaces here too
          const p = safePlaces.find((x) => x._id === id);
          if (p) m.content = createMarkerElement(p, id === place._id);
          m.zIndex = id === place._id ? 999 : undefined;
        });

        onMarkerClick(place);
      });

      markersRef.current.set(place._id, marker);
      newMarkers.push(marker);
    }

    clustererRef.current = new MarkerClusterer({
      map,
      markers: newMarkers,
    });
  }, [clearMarkers, isLoaded, onMarkerClick, places]);

  useEffect(() => {
    rebuildMarkers();
    return () => {
      clearMarkers();
    };
  }, [places, rebuildMarkers, clearMarkers]);

  useEffect(() => {
    if (!isLoaded) return;

    const newId = selectedPlace?._id || null;
    selectedIdRef.current = newId;

    // DEFENSIVE FIX: Provide an empty array fallback
    const safePlaces = places || [];

    markersRef.current.forEach((marker, id) => {
      const place = safePlaces.find((p) => p._id === id);
      if (!place) return;
      marker.content = createMarkerElement(place, id === newId);
      marker.zIndex = id === newId ? 999 : undefined;
    });
  }, [isLoaded, selectedPlace, places]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps?.marker) return;

    if (userCoords) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: userCoords.lat, lng: userCoords.lng },
          content: createUserMarker(),
          title: "Your location",
          zIndex: 1000,
        });
      } else {
        userMarkerRef.current.map = mapRef.current;
        userMarkerRef.current.position = { lat: userCoords.lat, lng: userCoords.lng };
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
      userMarkerRef.current = null;
    }
  }, [isLoaded, userCoords]);

  return (
    <div
      ref={mapDivRef}
      className="w-full h-full"
      aria-label="Interactive map of Karnataka places"
      role="application"
    />
  );
});