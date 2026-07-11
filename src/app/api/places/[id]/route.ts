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
    console.log("Requested Place ID:", id);
    const place = await Place.findById(id).populate({
      path: "gallery",
      options: { sort: { createdAt: -1 } },
    }).lean();
    console.log("Found Place:", place);

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
