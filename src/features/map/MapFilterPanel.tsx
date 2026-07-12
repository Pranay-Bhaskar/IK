
"use client";

import { cn } from "@/lib/utils";
import { PLACE_CATEGORIES } from "./constants";
import type { PlaceCategory } from "@/types";

interface MapFilterPanelProps {
  activeCategory: PlaceCategory | "";
  onChange: (cat: PlaceCategory | "") => void;
}

export function MapFilterPanel({ activeCategory, onChange }: MapFilterPanelProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 px-1"
      style={{ scrollbarWidth: "none" }}
      aria-label="Filter places by category"
    >
      
      <button
        onClick={() => onChange("")}
        aria-pressed={activeCategory === ""}
        className={cn(
          "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-all active:scale-95",
          activeCategory === ""
            ? "bg-white text-black border-white shadow-md"
            : "bg-black/60 border-white/20 text-white/80 hover:border-white/40 backdrop-blur-sm"
        )}
      >
        <span>✨</span>
        <span>All</span>
      </button>

      {PLACE_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(isActive ? "" : cat.value)}
            aria-pressed={isActive}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-all active:scale-95",
              isActive
                ? "text-white border-transparent shadow-md"
                : "bg-black/60 border-white/20 text-white/80 hover:border-white/40 backdrop-blur-sm"
            )}
            style={isActive ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/*

"use client";

import { cn } from "@/lib/utils";
import { PLACE_CATEGORIES } from "./constants";
import type { PlaceCategory } from "@/types";

interface MapFilterPanelProps {
  activeCategory: PlaceCategory | "";
  onChange: (cat: PlaceCategory | "") => void;
}

export function MapFilterPanel({ activeCategory, onChange }: MapFilterPanelProps) {
  return (
    <div className="absolute top-16 left-4 right-4 z-10">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-xl">
        <div
          className="flex gap-2 overflow-x-auto pb-1 px-1"
          style={{ scrollbarWidth: "none" }}
          aria-label="Filter places by category"
        >
          {/* All chip *}
          <button
            onClick={() => onChange("")}
            aria-pressed={activeCategory === ""}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-all active:scale-95",
              activeCategory === ""
                ? "bg-white text-black border-white shadow-md"
                : "bg-black/60 border-white/20 text-white/80 hover:border-white/40 backdrop-blur-sm"
            )}
          >
            <span>✨</span>
            <span>All</span>
          </button>

          {PLACE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onChange(isActive ? "" : cat.value)}
                aria-pressed={isActive}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-all active:scale-95",
                  isActive
                    ? "text-white border-transparent shadow-md"
                    : "bg-black/60 border-white/20 text-white/80 hover:border-white/40 backdrop-blur-sm"
                )}
                style={
                  isActive
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : {}
                }
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
*/