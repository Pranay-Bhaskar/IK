"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeolocationPermissionState = "prompt" | "granted" | "denied" | "unsupported";

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface UseGeolocationResult {
  coords: Coords | null;
  permissionState: GeolocationPermissionState;
  requesting: boolean;
  error: string | null;
  requestLocation: () => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permissionState, setPermissionState] = useState<GeolocationPermissionState>("prompt");
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      return;
    }

    // Check existing permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionState(result.state as GeolocationPermissionState);
        result.onchange = () => setPermissionState(result.state as GeolocationPermissionState);

        // Auto-fetch if already granted
        if (result.state === "granted") {
          startWatching();
        }
      });
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchId.current !== null) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setPermissionState("granted");
        setRequesting(false);
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState("denied");
          setError("Location permission denied");
        } else {
          setError("Unable to retrieve location");
        }
        setRequesting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setRequesting(true);
    setError(null);
    startWatching();
  }, [startWatching]);

  return { coords, permissionState, requesting, error, requestLocation };
}
