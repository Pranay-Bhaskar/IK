"use client";

import { useEffect, useState } from "react";

interface UseGoogleMapsOptions {
  apiKey: string;
  libraries?: string[];
}

interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
}

declare global {
  interface Window {
    __googleMapsInitCallback?: () => void;
    google?: typeof google;
  }
}

let loadPromise: Promise<void> | null = null;
let isScriptAdded = false;

function loadScript(apiKey: string, libraries: string[]): Promise<void> {
  if (loadPromise) return loadPromise;
  if (typeof window === "undefined") return Promise.resolve();

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    if (isScriptAdded) {
      const check = window.setInterval(() => {
        if (window.google?.maps) {
          window.clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }

    isScriptAdded = true;

    window.__googleMapsInitCallback = () => {
      resolve();
      delete window.__googleMapsInitCallback;
    };

    const script = document.createElement("script");
    const libs = libraries.join(",");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}&callback=__googleMapsInitCallback&loading=async`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      delete window.__googleMapsInitCallback;
      reject(new Error("Google Maps failed to load"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useGoogleMaps({
  apiKey,
  libraries = ["marker"],
}: UseGoogleMapsOptions): UseGoogleMapsResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!apiKey) {
      setLoadError(new Error("No Google Maps API key provided"));
      return;
    }

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    loadScript(apiKey, libraries)
      .then(() => {
        if (!cancelled) setIsLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err : new Error("Google Maps failed to load"));
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, libraries]);

  return { isLoaded, loadError };
}