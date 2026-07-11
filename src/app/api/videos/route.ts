/*
import { NextRequest } from "next/server";
import "@/models/User";
import { connectDB } from "@/lib/db/connect";
import { Video } from "@/models/Video";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/utils";
import { FEED_PAGE_SIZE } from "@/constants";

export const runtime = "nodejs";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(FEED_PAGE_SIZE), 10)));
    const category = searchParams.get("category");
    const placeId = searchParams.get("placeId");
    const radiusKm = parseFloat(searchParams.get("radius") || "0");
    const userLat = parseFloat(searchParams.get("lat") || "");
    const userLon = parseFloat(searchParams.get("lon") || "");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { status: "APPROVED" };
    if (category) query.category = category;
    if (placeId) query.placeId = placeId;

    let videos = await Video.find(query)
      .populate("uploadedBy", "fullName profileImage district isVerified")
      .populate("placeId", "name district city state category location thumbnailUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Video.countDocuments(query);

    if (radiusKm > 0 && !Number.isNaN(userLat) && !Number.isNaN(userLon)) {
      videos = videos.filter((v: any) => {
        const coords = v.placeId?.location?.coordinates;
        if (!coords) return true;
        const [lng, lat] = coords;
        const d = haversineKm(userLat, userLon, lat, lng);
        v.distanceKm = Math.round(d * 10) / 10;
        return d <= radiusKm;
      });
    }

    return apiSuccess({
      videos,
      total,
      page,
      limit,
      hasMore: skip + videos.length < total,
    });
  } catch (err) {
    console.error("[GET /api/videos]", err);
    return apiError("Failed to load feed", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return apiError("Not authenticated", 401);
    if (user.role !== "CREATOR") return apiError("Only creators can upload videos", 403);

    const body = await req.json();
    const {
      title,
      description,
      category,
      placeId,
      tags,
      url,
      thumbnailUrl,
      publicId,
      type = "video",
      sourceType = "cloudinary",
    } = body;

    if (!title || !description || !category || !placeId || !url) {
      return apiError("Missing required fields", 400);
    }

    const video = await Video.create({
      title: title.trim(),
      description: description.trim(),
      category,
      placeId,
      tags: tags || [],
      url,
      thumbnailUrl,
      publicId,
      type,
      sourceType,
      uploadedBy: user.id,
      status: "APPROVED",
    });

    return apiSuccess({ video }, "Video created", 201);
  } catch (err) {
    console.error("[POST /api/videos]", err);
    return apiError("Failed to save video", 500);
  }
}



*/


import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Video } from "@/models/Video";
import { Place } from "@/models/Place";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/utils";
import { FEED_PAGE_SIZE } from "@/constants";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(FEED_PAGE_SIZE), 10)));
    const category = searchParams.get("category");
    const placeId = searchParams.get("placeId");
    
    const radiusKm = parseFloat(searchParams.get("radius") || "0");
    const userLat = parseFloat(searchParams.get("lat") || "");
    const userLon = parseFloat(searchParams.get("lon") || "");
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { status: "APPROVED" };
    if (category) query.category = category;
    if (placeId) query.placeId = placeId;

    if (radiusKm > 0 && !Number.isNaN(userLat) && !Number.isNaN(userLon)) {
      const nearbyPlaces = await Place.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [userLon, userLat] },
            $maxDistance: radiusKm * 1000,
          },
        },
      }).select("_id");
      
      const nearbyIds = nearbyPlaces.map(p => p._id);
      query.placeId = { $in: nearbyIds };
    }

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate("uploadedBy", "fullName profileImage district isVerified")
        .populate("placeId", "name district city state category location thumbnailUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Video.countDocuments(query),
    ]);

    return apiSuccess({
      videos,
      total,
      page,
      limit,
      hasMore: skip + videos.length < total,
    });
  } catch (err) {
    console.error("[GET /api/videos]", err);
    return apiError("Failed to load feed", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return apiError("Not authenticated", 401);
    
    if (user.role !== "CREATOR" && user.role !== "ADMIN") {
      return apiError("Only creators can upload videos", 403);
    }

    const body = await req.json();
    let { title, description, category, placeId, tags, url, thumbnailUrl, publicId, type = "video", placeName, district, latitude, longitude } = body;

    // Logic: Find or Create Place if ID is missing
    if (!placeId && placeName && district) {
      let place = await Place.findOne({ name: { $regex: new RegExp(`^${placeName}$`, "i") }, district });
      
      if (!place) {
        // USE COORDINATES FROM BODY OR DEFAULTS
        const coords = [
          parseFloat(longitude) || 77.5946, 
          parseFloat(latitude) || 12.9716
        ];

        place = await Place.create({ 
          name: placeName, 
          district: district, 
          category: category || "OTHER", 
          location: { type: "Point", coordinates: coords }
        });
      }
      placeId = place._id;
    }

    if (!title || !description || !category || !placeId || !url) {
      return apiError("Missing required fields", 400);
    }

    const video = await Video.create({
      title: title.trim(),
      description: description.trim(),
      category,
      placeId,
      tags: Array.isArray(tags) ? tags : [],
      url,
      thumbnailUrl,
      publicId,
      type,
      sourceType: "cloudinary",
      uploadedBy: user.id,
      status: "APPROVED",
    });

    return apiSuccess({ video }, "Video created", 201);
  } catch (err: any) {
  console.error("[POST /api/videos] Error:", err.message); // This will show you Mongoose validation errors
    if (err.name === 'ValidationError') {
      return apiError("Invalid data: " + err.message, 400);
    }
    return apiError("Failed to save video", 500);
  }
}