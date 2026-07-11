import mongoose from 'mongoose';
import { Place } from '../models/Place';
import { Media } from '../models/Media';
import dbConnect from '../lib/mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Run this script using something like:
 * npx ts-node src/scripts/youtubeImporter.ts <PLAYLIST_ID>
 */
async function importYouTubePlaylist(playlistId: string) {
  if (!YOUTUBE_API_KEY) {
    console.error('YOUTUBE_API_KEY is not defined in .env.local');
    process.exit(1);
  }

  await dbConnect();
  
  // Dummy uploader user ID (replace with a real admin ID in production)
  const dummyUserId = new mongoose.Types.ObjectId();

  let nextPageToken = '';
  let count = 0;

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        console.error('YouTube API Error:', data.error.message);
        break;
      }

      for (const item of data.items) {
        const videoId = item.contentDetails.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        const thumbnailUrl = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url;

        // Note: For a real application, you would either parse the location from the description,
        // or have a predefined mapping of videoId -> Coordinates. 
        // Here we create a generic 'Imported Location' for demonstration.
        const placeName = `Imported Location: ${title.substring(0, 30)}`;
        let place = await Place.findOne({ name: placeName });

        if (!place) {
          place = new Place({
            name: placeName,
            location: {
              type: 'Point',
              coordinates: [77.5946, 12.9716], // Defaulting to Bangalore coords
            },
            createdBy: dummyUserId,
          });
          await place.save();
        }

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        // Check if media already exists to avoid duplicates
        let media = await Media.findOne({ url: embedUrl });
        
        if (!media) {
          media = new Media({
            type: 'video',
            sourceType: 'youtube',
            url: embedUrl,
            thumbnailUrl,
            title,
            description,
            placeId: place._id,
            uploadedBy: dummyUserId,
            youtubeVideoId: videoId,
          });
          await media.save();

          place.gallery.push(media._id as mongoose.Types.ObjectId);
          await place.save();
          count++;
        }
      }

      nextPageToken = data.nextPageToken;
    } catch (err) {
      console.error('Error fetching playlist items:', err);
      break;
    }
  } while (nextPageToken);

  console.log(`Successfully imported ${count} videos from playlist.`);
  process.exit(0);
}

const playlistId = process.argv[2];
if (!playlistId) {
  console.log('Usage: npx ts-node src/scripts/youtubeImporter.ts <PLAYLIST_ID>');
  process.exit(1);
}

importYouTubePlaylist(playlistId);
