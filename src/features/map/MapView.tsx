
"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
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
    swLat: number; swLng: number;
    neLat: number; neLng: number;
  }) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  RESTAURANT: "#ef4444", CAFE: "#f59e0b", "STREET FOOD": "#f97316",
  BAR: "#8b5cf6", NATURE: "#22c55e", HERITAGE: "#eab308",
  TEMPLE: "#ec4899", BEACH: "#06b6d4", WILDLIFE: "#84cc16", OTHER: "#6b7280",
};
const CATEGORY_EMOJI: Record<string, string> = {
  RESTAURANT: "🍽", CAFE: "☕", "STREET FOOD": "🌮", BAR: "🍺",
  NATURE: "🌿", HERITAGE: "🏛", TEMPLE: "🛕", BEACH: "🏖",
  WILDLIFE: "🐘", OTHER: "📍",
};

function createMarkerElement(place: IPlace, isSelected: boolean): HTMLElement {
  const color = CATEGORY_COLORS[place.category || "OTHER"] || "#6b7280";
  const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";
  const scale  = isSelected ? 1.3 : 1;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    transform: scale(${scale});
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  const pin = document.createElement("div");
  pin.style.cssText = `
    width: 36px; height: 36px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px ${color}55;
    border: 2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.4)"};
    transition: border 0.15s ease;
  `;

  const inner = document.createElement("span");
  inner.style.cssText = "transform: rotate(45deg); font-size: 14px; line-height: 1;";
  inner.textContent = emoji;
  pin.appendChild(inner);

  const tip = document.createElement("div");
  tip.style.cssText = `
    width: 0; height: 0;
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
  wrapper.style.cssText = "position: relative; display: flex; align-items: center; justify-content: center;";

  const pulse = document.createElement("div");
  pulse.style.cssText = `
    position: absolute;
    width: 40px; height: 40px;
    background: rgba(59,130,246,0.25);
    border-radius: 50%;
    animation: userPulse 2s ease-in-out infinite;
  `;

  const dot = document.createElement("div");
  dot.style.cssText = `
    width: 16px; height: 16px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(59,130,246,0.6);
    position: relative; z-index: 1;
  `;

  wrapper.appendChild(pulse);
  wrapper.appendChild(dot);
  return wrapper;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { isLoaded, places, selectedPlace, userCoords, onMarkerClick, onBoundsChange },
  ref
) {
  const mapDivRef    = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<google.maps.Map | null>(null);
  const markersRef   = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const clustererRef = useRef<import("@googlemaps/markerclusterer").MarkerClusterer | null>(null);
  const selectedRef  = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    panTo(lat: number, lng: number, zoom = 15) {
      if (!mapRef.current) return;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(zoom);
    },
    getMap() { return mapRef.current; },
  }));

  // Init map
  useEffect(() => {
    if (!isLoaded || !mapDivRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapDivRef.current, {
      center: KARNATAKA_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: true,
      gestureHandling: "greedy",
      styles: DARK_MAP_STYLES,
      mapTypeId: "roadmap",
    });

    mapRef.current = map;

    // Bounds change handler
    map.addListener("idle", () => {
      const b = map.getBounds();
      if (!b || !onBoundsChange) return;
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      onBoundsChange({
        swLat: sw.lat(), swLng: sw.lng(),
        neLat: ne.lat(), neLng: ne.lng(),
      });
    });
  }, [isLoaded, onBoundsChange]);

  // Sync markers when places change
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = mapRef.current;
    const existingIds = new Set(markersRef.current.keys());
    const newIds = new Set(places.map((p) => p._id));

    // Remove stale markers
    existingIds.forEach((id) => {
      if (!newIds.has(id)) {
        const m = markersRef.current.get(id)!;
        m.map = null;
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    places.forEach((place) => {
      const [lng, lat] = place.location.coordinates;
      const isSelected = selectedRef.current === place._id;

      if (markersRef.current.has(place._id)) {
        // Update element for selection state
        const m = markersRef.current.get(place._id)!;
        m.content = createMarkerElement(place, isSelected);
        return;
      }

      const element = createMarkerElement(place, isSelected);
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: element,
        title: place.name,
        zIndex: isSelected ? 999 : undefined,
      });

      marker.addListener("click", () => {
        // De-select previous
        if (selectedRef.current && selectedRef.current !== place._id) {
          const prev = markersRef.current.get(selectedRef.current);
          const prevPlace = places.find((p) => p._id === selectedRef.current);
          if (prev && prevPlace) {
            prev.content = createMarkerElement(prevPlace, false);
            prev.zIndex = undefined;
          }
        }
        // Select this
        selectedRef.current = place._id;
        marker.content = createMarkerElement(place, true);
        marker.zIndex = 999;
        onMarkerClick(place);
      });

      markersRef.current.set(place._id, marker);
    });

    // Setup / update clustering
    const setupClusterer = async () => {
      const { MarkerClusterer } = await import("@googlemaps/markerclusterer");
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      } else {
        clustererRef.current = new MarkerClusterer({ map });
      }
      const markers = Array.from(markersRef.current.values());
      clustererRef.current.addMarkers(markers);
    };
    setupClusterer();
  }, [isLoaded, places, onMarkerClick]);

  // Update selected marker highlight
  useEffect(() => {
    if (!isLoaded) return;
    const newId = selectedPlace?._id || null;

    if (selectedRef.current && selectedRef.current !== newId) {
      const prev = markersRef.current.get(selectedRef.current);
      const prevPlace = places.find((p) => p._id === selectedRef.current);
      if (prev && prevPlace) {
        prev.content = createMarkerElement(prevPlace, false);
        (prev as google.maps.marker.AdvancedMarkerElement & { zIndex: unknown }).zIndex = undefined;
      }
    }

    if (newId) {
      const marker = markersRef.current.get(newId);
      const place  = places.find((p) => p._id === newId);
      if (marker && place) {
        marker.content = createMarkerElement(place, true);
        marker.zIndex = 999;
      }
    }

    selectedRef.current = newId;
  }, [isLoaded, selectedPlace, places]);

  // User location marker
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

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


/*


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
  const scale = isSelected ? 1.3 : 1;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    transform: scale(${scale});
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  const pin = document.createElement("div");
  pin.style.cssText = `
    width: 36px; height: 36px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px ${color}55;
    border: 2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.4)"};
    transition: border 0.15s ease;
  `;

  const inner = document.createElement("span");
  inner.style.cssText = "transform: rotate(45deg); font-size: 14px; line-height: 1;";
  inner.textContent = emoji;
  pin.appendChild(inner);

  const tip = document.createElement("div");
  tip.style.cssText = `
    width: 0; height: 0;
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
    width: 40px; height: 40px;
    background: rgba(59,130,246,0.25);
    border-radius: 50%;
    animation: userPulse 2s ease-in-out infinite;
  `;

  const dot = document.createElement("div");
  dot.style.cssText = `
    width: 16px; height: 16px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(59,130,246,0.6);
    position: relative; z-index: 1;
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
  const selectedRef = useRef<string | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

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
        const b = map.getBounds();
        if (!b || !onBoundsChange) return;
        const sw = b.getSouthWest();
        const ne = b.getNorthEast();
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

  const rebuildClusterer = useCallback(async () => {
    if (!mapRef.current) return;
    const { MarkerClusterer } = await import("@googlemaps/markerclusterer");

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    } else {
      clustererRef.current = new MarkerClusterer({ map: mapRef.current });
    }

    clustererRef.current.addMarkers(Array.from(markersRef.current.values()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncMarkers() {
      if (!isLoaded || !mapRef.current || !window.google?.maps?.marker) return;

      const map = mapRef.current;
      const existingIds = new Set(markersRef.current.keys());
      const newIds = new Set(places.map((p) => p._id));

      existingIds.forEach((id) => {
        if (!newIds.has(id)) {
          const m = markersRef.current.get(id);
          if (m) m.map = null;
          markersRef.current.delete(id);
        }
      });

      places.forEach((place) => {
        const [lng, lat] = place.location.coordinates;
        const isSelected = selectedRef.current === place._id;

        if (markersRef.current.has(place._id)) {
          const m = markersRef.current.get(place._id)!;
          m.content = createMarkerElement(place, isSelected);
          m.zIndex = isSelected ? 999 : undefined;
          return;
        }

        const element = createMarkerElement(place, isSelected);
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          content: element,
          title: place.name,
          zIndex: isSelected ? 999 : undefined,
        });

        marker.addListener("click", () => {
          if (selectedRef.current && selectedRef.current !== place._id) {
            const prev = markersRef.current.get(selectedRef.current);
            const prevPlace = places.find((p) => p._id === selectedRef.current);
            if (prev && prevPlace) {
              prev.content = createMarkerElement(prevPlace, false);
              prev.zIndex = undefined;
            }
          }

          selectedRef.current = place._id;
          marker.content = createMarkerElement(place, true);
          marker.zIndex = 999;
          onMarkerClick(place);
        });

        markersRef.current.set(place._id, marker);
      });

      if (!cancelled) {
        await rebuildClusterer();
      }
    }

    syncMarkers();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, places, onMarkerClick, rebuildClusterer]);

  useEffect(() => {
    if (!isLoaded) return;

    const newId = selectedPlace?._id || null;

    if (selectedRef.current && selectedRef.current !== newId) {
      const prev = markersRef.current.get(selectedRef.current);
      const prevPlace = places.find((p) => p._id === selectedRef.current);
      if (prev && prevPlace) {
        prev.content = createMarkerElement(prevPlace, false);
        prev.zIndex = undefined;
      }
    }

    if (newId) {
      const marker = markersRef.current.get(newId);
      const place = places.find((p) => p._id === newId);
      if (marker && place) {
        marker.content = createMarkerElement(place, true);
        marker.zIndex = 999;
      }
    }

    selectedRef.current = newId;
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


*/