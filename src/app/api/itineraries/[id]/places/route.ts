import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Itinerary } from "@/models/Itinerary";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/utils";
import mongoose from "mongoose"; // 👈 IMPORT THIS

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return apiError("Not authenticated", 401);
    
    const { id } = await params;
    const { videoId, placeName, district, thumbnailUrl, notes } = await req.json();

    // Validate inputs
    if (!videoId || !placeName) return apiError("videoId and placeName required", 400);

    const itin = await Itinerary.findOne({ _id: id, userId: user.id });
    if (!itin) return apiError("Itinerary not found", 404);

    // Ensure videoId is treated as an ObjectId for Mongoose
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const alreadyAdded = itin.places.some(
      (p: { videoId: any }) => p.videoId.toString() === videoId
    );
    
    if (alreadyAdded) return apiSuccess({ itinerary: itin }, "Already in itinerary");

    itin.places.push({ 
      videoId: videoObjectId, // Use the Object ID here
      placeName, 
      district, 
      thumbnailUrl, 
      notes, 
      addedAt: new Date() 
    });
    
    await itin.save();
    return apiSuccess({ itinerary: itin }, "Place added to itinerary");
  } catch (err: any) {
    console.error("[POST Add to Itinerary]", err);
    return apiError("Failed: " + err.message, 400);
  }
}