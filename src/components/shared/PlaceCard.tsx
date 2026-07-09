"use client";

import { MapPin, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import type { IPlace } from "@/types";
import { PLACE_CATEGORIES, CATEGORY_EMOJI } from "@/features/map/constants";

interface Props {
  place: IPlace;
}

const BG_COLORS = [
  "#134e4a","#3b0764","#78350f","#0c4a6e","#1e1b4b","#14532d","#1c1917","#0f172a",
];

export function PlaceCard({ place }: Props) {
  const router = useRouter();
  
  const bg = BG_COLORS[
    Math.abs((place._id.charCodeAt(0) || 0) + (place._id.charCodeAt(1) || 0)) % BG_COLORS.length
  ];

  const catConfig = PLACE_CATEGORIES.find(c => c.value === place.category);
  const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";

  return (
    <button
      onClick={() => router.push(`/map?placeId=${place._id}`)}
      className="flex-shrink-0 w-44 h-56 rounded-2xl overflow-hidden relative active:scale-[0.97] transition-all border border-white/10 group"
      style={{ background: bg }}
    >
      {place.thumbnailUrl ? (
        <img
          src={place.thumbnailUrl}
          alt={place.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-4xl opacity-50">{emoji}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      <div className="absolute inset-0 flex flex-col justify-between p-3.5">
        {/* Top row */}
        <div className="flex justify-start">
          {catConfig && (
            <span className="text-[10px] glass border border-white/15 rounded-full px-2.5 py-1 text-white font-bold tracking-wide">
              {emoji} {catConfig.label}
            </span>
          )}
        </div>

        {/* Bottom info */}
        <div>
          <h3 className="text-sm font-black text-white leading-tight line-clamp-2 mb-1.5">
            {place.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#2dd4bf] flex-shrink-0" />
            <span className="text-xs text-white/70 truncate">
              {[place.city, place.district].filter(Boolean).join(", ")}
            </span>
          </div>
          {place.distanceKm != null && (
            <div className="flex items-center gap-1.5 mt-2">
              <Navigation className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                {place.distanceKm} km away
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
