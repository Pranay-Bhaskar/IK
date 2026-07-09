"use client";

import { Locate, Loader2, LocateOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeolocationPermissionState } from "./useGeolocation";

interface GeolocationButtonProps {
  permissionState: GeolocationPermissionState;
  requesting: boolean;
  hasCoords: boolean;
  onClick: () => void;
}

export function GeolocationButton({
  permissionState,
  requesting,
  hasCoords,
  onClick,
}: GeolocationButtonProps) {
  const isDenied = permissionState === "denied";
  const isUnsupported = permissionState === "unsupported";

  if (isUnsupported) return null;

  return (
    <button
      onClick={onClick}
      disabled={isDenied || requesting}
      aria-label={
        isDenied ? "Location permission denied"
        : requesting ? "Getting your location..."
        : hasCoords ? "Re-center on your location"
        : "Show my location on map"
      }
      className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95",
        "bg-[#111827]/90 backdrop-blur-xl border",
        isDenied
          ? "border-red-500/40 text-red-400 cursor-not-allowed opacity-60"
          : hasCoords
          ? "border-blue-500/60 text-blue-400 shadow-blue-500/30"
          : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
      )}
      title={isDenied ? "Location access denied. Enable in browser settings." : undefined}
    >
      {requesting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isDenied ? (
        <LocateOff className="w-5 h-5" />
      ) : (
        <Locate className={cn("w-5 h-5", hasCoords && "fill-blue-400/30")} />
      )}
    </button>
  );
}
