"use client";

import { useState, useRef, useCallback } from "react";
import { Search, X, MapPin } from "lucide-react";
import type { IPlace } from "@/types";
import { CATEGORY_EMOJI } from "./constants";

interface MapSearchBarProps {
  places: IPlace[];
  onSelectPlace: (place: IPlace) => void;
}

export function MapSearchBar({ places, onSelectPlace }: MapSearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useCallback(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return places
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, places]);

  const results = filtered();
  const showDropdown = focused && results.length > 0;

  const handleSelect = (place: IPlace) => {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
    onSelectPlace(place);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Search input */}
      <div className="flex items-center gap-2 bg-[#111827]/90 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-2.5 shadow-2xl">
        <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search places, cities..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          aria-label="Search places on map"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="flex-shrink-0 p-0.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 text-white/50" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full mt-2 left-0 right-0 bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          role="listbox"
          aria-label="Search results"
        >
          {results.map((place) => {
            const [lng, lat] = place.location.coordinates;
            const emoji = CATEGORY_EMOJI[place.category || "OTHER"] || "📍";
            return (
              <button
                key={place._id}
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(place)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/8 transition-colors text-left border-b border-white/5 last:border-0"
              >
                <span className="text-lg flex-shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{place.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/50 truncate">
                      {[place.city, place.district].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </div>
                {place.category && (
                  <span className="text-xs text-white/30 capitalize flex-shrink-0">
                    {place.category.toLowerCase()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
