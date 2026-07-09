import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Place } from "@/models/Place";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page     = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit    = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const category = searchParams.get("category");
    const district = searchParams.get("district");
    const q        = searchParams.get("q");
    const skip     = (page - 1) * limit;

    // Geospatial params
    const lat       = parseFloat(searchParams.get("lat")    || "");
    const lng       = parseFloat(searchParams.get("lng")    || "");
    const radiusKm  = parseFloat(searchParams.get("radius") || "0");

    // Bounding box params
    const swLat = parseFloat(searchParams.get("swLat") || "");
    const swLng = parseFloat(searchParams.get("swLng") || "");
    const neLat = parseFloat(searchParams.get("neLat") || "");
    const neLng = parseFloat(searchParams.get("neLng") || "");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (district) query.district = district;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Priority 1: Radius search (near a point)
    if (!isNaN(lat) && !isNaN(lng) && radiusKm > 0) {
      query.location = {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000, // meters
        },
      };
    }
    // Priority 2: Bounding box search (viewport-based)
    else if (!isNaN(swLat) && !isNaN(swLng) && !isNaN(neLat) && !isNaN(neLng)) {
      query.location = {
        $geoWithin: {
          $box: [
            [swLng, swLat], // SW corner [lng, lat]
            [neLng, neLat], // NE corner [lng, lat]
          ],
        },
      };
    }

    const [places, total] = await Promise.all([
      Place.find(query).skip(skip).limit(limit).lean(),
      Place.countDocuments(query),
    ]);

    // Inject distanceKm when user location provided (not near-sphere case — that orders by distance)
    let enriched = places;
    if (!isNaN(lat) && !isNaN(lng)) {
      enriched = places.map((p) => {
        const [pLng, pLat] = p.location.coordinates;
        const R = 6371;
        const dLat = ((pLat - lat) * Math.PI) / 180;
        const dLon = ((pLng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((pLat * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
        return { ...p, distanceKm };
      });
    }

    return apiSuccess({
      places: enriched,
      total,
      page,
      limit,
      hasMore: skip + places.length < total,
    });
  } catch (err) {
    console.error("[GET /api/places]", err);
    return apiError("Failed to load places", 500);
  }
}
