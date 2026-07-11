import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Place } from "@/models/Place";
import { apiError, apiSuccess } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const category = searchParams.get("category");
    const district = searchParams.get("district");
    const q = searchParams.get("q");
    const skip = (page - 1) * limit;

    const latRaw = searchParams.get("lat");
    const lngRaw = searchParams.get("lng");
    const radiusRaw = searchParams.get("radius");

    const lat = latRaw === null ? NaN : parseFloat(latRaw);
    const lng = lngRaw === null ? NaN : parseFloat(lngRaw);
    const radiusKm = radiusRaw === null ? 0 : parseFloat(radiusRaw);

    const swLatRaw = searchParams.get("swLat");
    const swLngRaw = searchParams.get("swLng");
    const neLatRaw = searchParams.get("neLat");
    const neLngRaw = searchParams.get("neLng");

    const swLat = swLatRaw === null ? NaN : parseFloat(swLatRaw);
    const swLng = swLngRaw === null ? NaN : parseFloat(swLngRaw);
    const neLat = neLatRaw === null ? NaN : parseFloat(neLatRaw);
    const neLng = neLngRaw === null ? NaN : parseFloat(neLngRaw);

    const query: Record<string, unknown> = {};
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

    if (!Number.isNaN(lat) && !Number.isNaN(lng) && radiusKm > 0) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusKm / 6371],
        },
      };
    } else if (
      !Number.isNaN(swLat) &&
      !Number.isNaN(swLng) &&
      !Number.isNaN(neLat) &&
      !Number.isNaN(neLng)
    ) {
      query.location = {
        $geoWithin: {
          $box: [
            [swLng, swLat],
            [neLng, neLat],
          ],
        },
      };
    }

    const [places, total] = await Promise.all([
      Place.find(query)
        .populate({
          path: "gallery",
          options: { sort: { createdAt: -1 } },
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Place.countDocuments(query),
    ]);

    const enriched =
      !Number.isNaN(lat) && !Number.isNaN(lng)
        ? places.map((p: any) => {
            const [pLng, pLat] = p.location.coordinates;
            const R = 6371;
            const dLat = ((pLat - lat) * Math.PI) / 180;
            const dLon = ((pLng - lng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos((lat * Math.PI) / 180) *
                Math.cos((pLat * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
            const distanceKm = Math.round((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 10) / 10;
            return { ...p, distanceKm };
          })
        : places;

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