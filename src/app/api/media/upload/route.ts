import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Place } from "@/models/Place";
import { Media } from "@/models/Media";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      type,
      sourceType,
      url,
      thumbnailUrl,
      title,
      description,
      durationSeconds,
      publicId,
      youtubeVideoId,
      youtubePlaylistId,
      youtubeChannelId,
      placeName,
      coordinates,
      district,
      city,
      state,
      uploadedBy,
    } = body;

    if (!url || !type || !sourceType || !placeName || !coordinates || !uploadedBy) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    let place = await Place.findOne({ name: placeName, district, city, state });

    if (!place) {
      place = new Place({
        name: placeName,
        district,
        city,
        state,
        location: {
          type: "Point",
          coordinates,
        },
        createdBy: new mongoose.Types.ObjectId(uploadedBy),
      });
      await place.save();
    }

    const media = await Media.create({
      type,
      sourceType,
      url,
      thumbnailUrl,
      title,
      description,
      durationSeconds,
      publicId,
      youtubeVideoId,
      youtubePlaylistId,
      youtubeChannelId,
      placeId: place._id,
      uploadedBy: new mongoose.Types.ObjectId(uploadedBy),
      status: "APPROVED",
    });

    await Place.findByIdAndUpdate(place._id, {
      $addToSet: { gallery: media._id },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          media,
          place,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}