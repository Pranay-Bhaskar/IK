// scripts/seed-smart.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from "mongoose";
import { Media } from "../models/Media";
import { Place } from "../models/Place";
import { User } from "../models/User";
import "dotenv/config";

async function runSmartSeed() {
  await mongoose.connect(process.env.MONGODB_URI!);

  // 1. Get a User (assuming you have at least one user)
  const user = await User.findOne({});
  if (!user) throw new Error("No user found to assign as uploader");

  // 2. Define the Place info
  const placeData = {
    name: "Mangalore Food Stop", // The specific place from the video
    district: "Dakshina Kannada",
    category: "RESTAURANT",
    location: { type: "Point", coordinates: [74.8560, 12.9141] } // Mangalore coords
  };

  // 3. Find or Create the Place
  let place = await Place.findOne({ name: placeData.name });
  if (!place) {
    place = await Place.create(placeData);
    console.log("Created new place:", place.name);
  } else {
    console.log("Using existing place:", place.name);
  }

  // 4. Create the Media (Video)
  const videoData = {
    type: "video",
    sourceType: "youtube",
    url: "https://www.youtube.com/watch?v=zvX1bVd5R7A",
    title: "Rocky, Mayur go munching in Mangalore",
    placeId: place._id, // Links to the place we just found or created
    uploadedBy: user._id,
    status: "APPROVED"
  };

  await Media.create(videoData);
  console.log("Successfully linked video to place:", place.name);

  await mongoose.disconnect();
}

runSmartSeed();