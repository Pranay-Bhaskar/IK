import "dotenv/config";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models/User";
import { Place } from "@/models/Place";
import { Media } from "@/models/Media";
import { Video } from "@/models/Video";
import { SavedVideo } from "@/models/SavedVideo";

async function seed() {
  await dbConnect();

  await Promise.all([
    User.deleteMany({}),
    Place.deleteMany({}),
    Media.deleteMany({}),
    Video.deleteMany({}),
    SavedVideo.deleteMany({}),
  ]);

  const admin = await User.create({
    fullName: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "ADMIN",
    isVerified: true,
    isActive: true,
  });

  const creator = await User.create({
    fullName: "Creator User",
    email: "creator@example.com",
    password: "password123",
    role: "CREATOR",
    isVerified: true,
    isActive: true,
  });

  const place = await Place.create({
    name: "Coorg View Point",
    district: "Kodagu",
    city: "Madikeri",
    state: "Karnataka",
    category: "NATURE",
    description: "A scenic viewpoint in Coorg.",
    location: {
      type: "Point",
      coordinates: [75.7205, 12.4244],
    },
    createdBy: admin._id,
    status: "APPROVED",
    isVerified: true,
  });

  const media = await Media.create({
    type: "video",
    sourceType: "cloudinary",
    url: "https://example.com/sample-video.mp4",
    thumbnailUrl: "https://example.com/sample-thumb.jpg",
    title: "Coorg View Point Clip",
    description: "Short clip of the viewpoint.",
    placeId: place._id,
    uploadedBy: creator._id,
    status: "APPROVED",
    tags: ["nature", "kodagu"],
  });

  await Place.findByIdAndUpdate(place._id, {
    $addToSet: { gallery: media._id },
  });

  const video = await Video.create({
    type: "video",
    sourceType: "cloudinary",
    title: "Coorg View Point Clip",
    description: "Short clip of the viewpoint.",
    url: "https://example.com/sample-video.mp4",
    thumbnailUrl: "https://example.com/sample-thumb.jpg",
    publicId: "sample-public-id",
    category: "NATURE",
    placeId: place._id,
    uploadedBy: creator._id,
    status: "APPROVED",
    tags: ["nature", "kodagu"],
    views: 120,
    likesCount: 15,
    commentsCount: 3,
    sharesCount: 2,
    savesCount: 7,
  });

  console.log({
    admin: admin.email,
    creator: creator.email,
    place: place.name,
    media: media.title,
    video: video.title,
  });

  await mongoose.connection.close();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});