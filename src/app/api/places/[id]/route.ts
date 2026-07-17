/*
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Place } from "@/models/Place";
import { Video } from "@/models/Video";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const place = await Place.findById(id).populate({
      path: "gallery",
      options: { sort: { createdAt: -1 } },
    }).lean();
    

    if (!place) return apiError("Place not found", 404);

    const videos = await Video.find({ placeId: id, status: "APPROVED" })
      .populate("uploadedBy", "fullName profileImage district isVerified")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return apiSuccess({ place, videos });
  } catch (err) {
    console.error("[GET /api/places/:id]", err);
    return apiError("Failed to load place", 500);
  }
}

*/



//working



/*

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Place } from "@/models/Place";
import { Video } from "@/models/Video";
import { Media } from "@/models/Media"; // 👈 1. ADDED THIS IMPORT
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // 👈 2. ADDED THIS: Forces Mongoose to register the models before populating
    const _media = Media; 
    const _video = Video;

    const { id } = await params;
    
    const place = await Place.findById(id).populate({
      path: "gallery",
      options: { sort: { createdAt: -1 } },
    }).lean();

    if (!place) return apiError("Place not found", 404);

    const videos = await Video.find({ placeId: id, status: "APPROVED" })
      .populate("uploadedBy", "fullName profileImage district isVerified")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return apiSuccess({ place, videos });
  } catch (err) {
    console.error("[GET /api/places/:id]", err);
    return apiError("Failed to load place", 500);
  }
}



//  NEW

*/

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Place } from "@/models/Place";
import { Video } from "@/models/Video";
import { Media } from "@/models/Media";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Explicitly reference models to trigger Mongoose registration
    const _forceModels = [Place, Video, Media];

    const { id } = await params;
    
    const place = await Place.findById(id).populate({
      path: "gallery",
      options: { sort: { createdAt: -1 } },
    }).lean();

    if (!place) return apiError("Place not found", 404);

    const videos = await Video.find({ placeId: id, status: "APPROVED" })
      .populate("uploadedBy", "fullName profileImage district isVerified")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return apiSuccess({ place, videos });
  } catch (err) {
    console.error("[GET /api/places/:id]", err);
    return apiError("Failed to load place", 500);
  }
}