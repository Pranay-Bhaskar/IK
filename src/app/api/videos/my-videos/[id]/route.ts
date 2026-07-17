import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Video } from "@/models/Video";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return apiError("Not authenticated", 401);
    
    // Only creators can access their own "my-videos"
    if (user.role !== "CREATOR") return apiError("Creators only", 403);

    const { id } = await params;
    
    const video = await Video.findOne({ 
      _id: id, 
      uploadedBy: user.id 
    })
    .populate("placeId", "name district city state category location thumbnailUrl")
    .lean();

    if (!video) return apiError("Video not found or unauthorized", 404);

    return apiSuccess(video);
  } catch (err) {
    console.error("[GET /api/videos/my-videos/:id]", err);
    return apiError("Failed to load video details", 500);
  }
}