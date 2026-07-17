/*
import { NextRequest } from "next/server";
import "@/models/User";
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
    const { id } = await params;

    const video = await Video.findById(id)
      .populate("uploadedBy", "fullName profileImage district isVerified bio")
      .populate("placeId", "name district city state category location thumbnailUrl")
      .lean();

    if (!video) return apiError("Video not found", 404);
    if (video.status !== "APPROVED") return apiError("Video not available", 403);

    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return apiSuccess({ video });
  } catch (err) {
    console.error("[GET /api/videos/[id]]", err);
    return apiError("Failed to load video", 500);
  }
}
*/


import { NextRequest } from "next/server";
import "@/models/User";
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
    const { id } = await params;
    const user = await getAuthUser(); // Get current user session

    const video = await Video.findById(id)
      .populate("uploadedBy", "fullName profileImage district isVerified bio")
      .populate("placeId", "name district city state category location thumbnailUrl")
      .lean();

    if (!video) return apiError("Video not found", 404);

    // FIX: Allow Creator (Owner) or Admin to view regardless of status
    const isOwner = video.uploadedBy?._id?.toString() === user?.id;
    const isAdmin = user?.role === "ADMIN";

    if (video.status !== "APPROVED" && !isOwner && !isAdmin) {
      return apiError("Video not available", 403);
    }

    // Only increment views if it's actually live
    if (video.status === "APPROVED") {
      await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    return apiSuccess({ video });
  } catch (err) {
    console.error("[GET /api/videos/[id]]", err);
    return apiError("Failed to load video", 500);
  }
}
// DELETE remains the same as your previous version...




export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return apiError("Not authenticated", 401);

    const { id } = await params;
    const video = await Video.findById(id);
    if (!video) return apiError("Video not found", 404);

    const isOwner = video.uploadedBy?.toString() === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) return apiError("Not authorized", 403);

    await Video.findByIdAndDelete(id);
    return apiSuccess(null, "Video deleted");
  } catch (err) {
    console.error("[DELETE /api/videos/[id]]", err);
    return apiError("Failed to delete video", 500);
  }
}