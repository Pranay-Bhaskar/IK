import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Place } from "../models/Place";
import { Media } from "../models/Media";
import { User } from "../models/User";
import dbConnect from "../lib/mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function importYouTubePlaylist(playlistId: string) {
  if (!YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY is not defined in .env.local");
    process.exit(1);
  }

  await dbConnect();

  let uploader = await User.findOne({ role: "ADMIN" });
  if (!uploader) {
    uploader = await User.create({
      fullName: "YouTube Importer",
      email: "importer@example.com",
      password: "password123",
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    });
  }

  const uploaderId = uploader._id;
  let nextPageToken = "";
  let count = 0;

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        console.error("YouTube API Error:", data.error.message);
        break;
      }

      for (const item of data.items || []) {
        const videoId = item.contentDetails?.videoId;
        const title = item.snippet?.title || "Untitled";
        const description = item.snippet?.description || "";
        const thumbnailUrl = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url;

        if (!videoId) continue;

        const placeName = `Imported Location: ${title.substring(0, 30)}`;
        let place = await Place.findOne({ name: placeName });

        if (!place) {
          place = new Place({
            name: placeName,
            location: {
              type: "Point",
              coordinates: [77.5946, 12.9716],
            },
            createdBy: uploaderId,
          });
          await place.save();
        }

        const embedUrl = `https://www.youtube.com/watch?v=${videoId}`;
        let media = await Media.findOne({ youtubeVideoId: videoId });

        if (!media) {
          media = new Media({
            type: "video",
            sourceType: "youtube",
            url: embedUrl,
            thumbnailUrl,
            title,
            description,
            placeId: place._id,
            uploadedBy: uploaderId,
            youtubeVideoId: videoId,
            status: "APPROVED",
          });
          await media.save();

          await Place.findByIdAndUpdate(place._id, {
            $addToSet: { gallery: media._id },
          });

          count++;
        }
      }

      nextPageToken = data.nextPageToken || "";
    } catch (err) {
      console.error("Error fetching playlist items:", err);
      break;
    }
  } while (nextPageToken);

  console.log(`Successfully imported ${count} videos from playlist.`);
  await mongoose.connection.close();
  process.exit(0);
}

const playlistId = process.argv[2];
if (!playlistId) {
  console.log("Usage: npx tsx src/scripts/youtubeImporter.ts <PLAYLIST_ID>");
  process.exit(1);
}

importYouTubePlaylist(playlistId);