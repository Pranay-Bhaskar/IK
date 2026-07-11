import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Media } from "@/models/Media";
import { Place } from "@/models/Place";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const mediaList = await Media.find({ status: "APPROVED" })
      .populate({
        path: "placeId",
        populate: {
          path: "gallery",
          options: { sort: { createdAt: -1 } },
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Media.countDocuments({ status: "APPROVED" });

    return NextResponse.json({
      success: true,
      data: {
        media: mediaList,
      },
      pagination: {
        total,
        skip,
        limit,
        hasMore: skip + limit < total,
      },
    });
  } catch (error: any) {
    console.error("Roam Feed API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}