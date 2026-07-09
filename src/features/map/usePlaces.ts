"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IPlace, PlaceCategory } from "@/types";

interface UsePlacesOptions {
  category: PlaceCategory | "";
  enabled?: boolean;
}

interface UsePlacesResult {
  places: IPlace[];
  loading: boolean;
  error: string | null;
  fetchByBounds: (bounds: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  }) => void;
  fetchNearby: (lat: number, lng: number, radiusKm?: number) => Promise<IPlace[]>;
  refetch: () => void;
}

export function usePlaces({
  category,
  enabled = true,
}: UsePlacesOptions): UsePlacesResult {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastCategory = useRef(category);

  const fetchAll = useCallback(async (cat: PlaceCategory | "") => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (cat) params.set("category", cat);
      const res = await fetch(`/api/places?${params}`, {
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      if (data.success) setPlaces(data.data.places);
      else setError(data.error || "Failed to load places");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Network error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial + category-change fetch
  useEffect(() => {
    if (!enabled) return;
    if (lastCategory.current !== category) {
      lastCategory.current = category;
    }
    fetchAll(category);
  }, [category, enabled, fetchAll]);

  // Debounced bounds-based fetch
  const fetchByBounds = useCallback(
    (bounds: { swLat: number; swLng: number; neLat: number; neLng: number }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
          const params = new URLSearchParams({
            swLat: String(bounds.swLat),
            swLng: String(bounds.swLng),
            neLat: String(bounds.neLat),
            neLng: String(bounds.neLng),
            limit: "200",
          });
          if (category) params.set("category", category);
          const res = await fetch(`/api/places?${params}`, {
            signal: abortRef.current.signal,
          });
          const data = await res.json();
          if (data.success) setPlaces(data.data.places);
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            console.error("Bounds fetch error:", err);
          }
        }
      }, 400);
    },
    [category]
  );

  const fetchNearby = useCallback(
    async (lat: number, lng: number, radiusKm = 25): Promise<IPlace[]> => {
      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          radius: String(radiusKm),
          limit: "20",
        });
        if (category) params.set("category", category);
        const res = await fetch(`/api/places?${params}`);
        const data = await res.json();
        if (data.success) return data.data.places;
        return [];
      } catch {
        return [];
      }
    },
    [category]
  );

  return {
    places,
    loading,
    error,
    fetchByBounds,
    fetchNearby,
    refetch: () => fetchAll(category),
  };
}
