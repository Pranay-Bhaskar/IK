import type { PlaceCategory } from "@/types";

export interface PlaceCategoryConfig {
  value: PlaceCategory;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const PLACE_CATEGORIES: PlaceCategoryConfig[] = [
  { value: "RESTAURANT",  label: "Restaurant",  emoji: "🍽",  color: "#ef4444", bgColor: "rgba(239,68,68,0.15)" },
  { value: "CAFE",        label: "Café",         emoji: "☕",  color: "#f59e0b", bgColor: "rgba(245,158,11,0.15)" },
  { value: "STREET FOOD", label: "Street Food",  emoji: "🌮",  color: "#f97316", bgColor: "rgba(249,115,22,0.15)" },
  { value: "BAR",         label: "Bar",          emoji: "🍺",  color: "#8b5cf6", bgColor: "rgba(139,92,246,0.15)" },
  { value: "NATURE",      label: "Nature",       emoji: "🌿",  color: "#22c55e", bgColor: "rgba(34,197,94,0.15)" },
  { value: "HERITAGE",    label: "Heritage",     emoji: "🏛",  color: "#eab308", bgColor: "rgba(234,179,8,0.15)" },
  { value: "TEMPLE",      label: "Temple",       emoji: "🛕",  color: "#ec4899", bgColor: "rgba(236,72,153,0.15)" },
  { value: "BEACH",       label: "Beach",        emoji: "🏖",  color: "#06b6d4", bgColor: "rgba(6,182,212,0.15)" },
  { value: "WILDLIFE",    label: "Wildlife",     emoji: "🐘",  color: "#84cc16", bgColor: "rgba(132,204,22,0.15)" },
  { value: "OTHER",       label: "Other",        emoji: "📍",  color: "#6b7280", bgColor: "rgba(107,114,128,0.15)" },
];

export const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
  PLACE_CATEGORIES.map((c) => [c.value, c.color])
);

export const CATEGORY_EMOJI: Record<string, string> = Object.fromEntries(
  PLACE_CATEGORIES.map((c) => [c.value, c.emoji])
);

/** Default Karnataka center coordinates */
export const KARNATAKA_CENTER = { lat: 15.3173, lng: 75.7139 };

/** Default map zoom level */
export const DEFAULT_ZOOM = 7;

/** Zoom level at which clusters expand */
export const CLUSTER_ZOOM_THRESHOLD = 12;

/** Map styles for dark theme */
export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",        stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d16" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#a0a0b0" }] },
  { featureType: "road",            elementType: "geometry",       stylers: [{ color: "#2a2a4e" }] },
  { featureType: "road",            elementType: "geometry.stroke",stylers: [{ color: "#1a1a3e" }] },
  { featureType: "road",            elementType: "labels.text.fill",stylers: [{ color: "#8888aa" }] },
  { featureType: "road.highway",    elementType: "geometry",       stylers: [{ color: "#3a3a6e" }] },
  { featureType: "road.highway",    elementType: "geometry.stroke",stylers: [{ color: "#2a2a5e" }] },
  { featureType: "water",           elementType: "geometry",       stylers: [{ color: "#0d2137" }] },
  { featureType: "water",           elementType: "labels.text.fill",stylers: [{ color: "#4e8fa8" }] },
  { featureType: "poi",             elementType: "geometry",       stylers: [{ color: "#1e1e3e" }] },
  { featureType: "poi.park",        elementType: "geometry",       stylers: [{ color: "#0f2e1f" }] },
  { featureType: "poi",             elementType: "labels.text.fill",stylers: [{ color: "#6b6b8a" }] },
  { featureType: "landscape",       elementType: "geometry",       stylers: [{ color: "#16162a" }] },
  { featureType: "administrative",  elementType: "geometry.stroke",stylers: [{ color: "#3a3a5e" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9d9db8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#c0c0d8" }] },
  { featureType: "transit",         elementType: "geometry",       stylers: [{ color: "#2f3348" }] },
];
