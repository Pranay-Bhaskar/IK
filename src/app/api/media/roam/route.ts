/*
import { connectDB } from "@/lib/db/connect";
import { Video } from "@/models/Video"; // Import Video instead of Media

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "5");

  // Query Video instead of Media
  const data = await Video.find({ status: "APPROVED" })
    .populate("placeId", "name location") // Ensures placeId is populated
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Video.countDocuments({ status: "APPROVED" });

  return Response.json({
    success: true,
    data,
    pagination: { hasMore: skip + data.length < total }
  });
}
  */

import { connectDB } from "@/lib/db/connect";
import { Video } from "@/models/Video";
import { Media } from "@/models/Media";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "5");

  // Fetch both concurrently
  const [videos, media] = await Promise.all([
    Video.find({ status: "APPROVED" }).populate("placeId", "name location").lean(),
    Media.find({ status: "APPROVED" }).populate("placeId", "name location").lean()
  ]);

  // Merge, sort by createdAt, and apply pagination
  const combinedData = [...videos, ...media].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const paginatedData = combinedData.slice(skip, skip + limit);

  return Response.json({
    success: true,
    data: paginatedData,
    pagination: { hasMore: skip + paginatedData.length < combinedData.length }
  });
}