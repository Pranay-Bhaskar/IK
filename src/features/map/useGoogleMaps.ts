"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseGoogleMapsOptions {
  apiKey: string;
  libraries?: string[];
}

interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
}

let loadPromise: Promise<void> | null = null;
let isScriptAdded = false;

function loadScript(apiKey: string, libraries: string[]): Promise<void> {
  if (loadPromise) return loadPromise;
  if (typeof window === "undefined") return Promise.resolve();

  loadPromise = new Promise((resolve, reject) => {
    if (isScriptAdded) {
      // Script already in DOM, wait for callback
      const check = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }

    isScriptAdded = true;
    const callbackName = "__googleMapsInitCallback";
    (window as Record<string, unknown>)[callbackName] = () => resolve();

    const script = document.createElement("script");
    const libs = libraries.join(",");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}&callback=${callbackName}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
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
    if (!apiKey) {
      setLoadError(new Error("No Google Maps API key provided"));
      return;
    }

    // Already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    loadScript(apiKey, libraries)
      .then(() => setIsLoaded(true))
      .catch((err) => setLoadError(err));
  }, [apiKey, libraries]);

  return { isLoaded, loadError };
}
