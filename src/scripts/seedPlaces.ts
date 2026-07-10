/*
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Minimal inline Place model definition for standalone script execution
const PlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String },
    city: { type: String },
    state: { type: String, default: "Karnataka" },
    category: {
      type: String,
      enum: ["RESTAURANT", "CAFE", "STREET FOOD", "BAR", "NATURE", "HERITAGE", "TEMPLE", "BEACH", "WILDLIFE", "OTHER"],
    },
    description: { type: String },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: "2dsphere" });
const Place = mongoose.models.Place || mongoose.model("Place", PlaceSchema);

const SEED_PLACES = [
  {
    name: "Mysore Palace",
    district: "Mysuru",
    city: "Mysuru",
    category: "HERITAGE",
    description: "A historical palace and a royal residence. It is the official residence of the Wadiyar dynasty and the seat of the Kingdom of Mysore.",
    location: { type: "Point", coordinates: [76.6552, 12.3051] },
    thumbnailUrl: "https://images.unsplash.com/photo-1600014798606-f6406e41b9c9?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Jog Falls",
    district: "Shivamogga",
    city: "Sagara",
    category: "NATURE",
    description: "The second-highest plunge waterfall in India, created by the Sharavathi River dropping 253 m, making it a major tourist attraction.",
    location: { type: "Point", coordinates: [74.8166, 14.2290] },
    thumbnailUrl: "https://images.unsplash.com/photo-1627896472477-8d02c89dbd17?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Gokarna Om Beach",
    district: "Uttara Kannada",
    city: "Gokarna",
    category: "BEACH",
    description: "Famous for its Om shape, this pristine beach offers water sports, beachside cafes, and stunning sunset views.",
    location: { type: "Point", coordinates: [74.3188, 14.5186] },
    thumbnailUrl: "https://images.unsplash.com/photo-1590226343360-1436eb46ef27?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Mylari Hotel (Original)",
    district: "Mysuru",
    city: "Mysuru",
    category: "RESTAURANT",
    description: "Iconic eatery serving the famous melt-in-mouth Mylari dosa with a dollop of butter since the 1940s.",
    location: { type: "Point", coordinates: [76.6631, 12.3102] },
    thumbnailUrl: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Bandipur National Park",
    district: "Chamarajanagar",
    city: "Bandipur",
    category: "WILDLIFE",
    description: "One of India's best tiger reserves. Offers thrilling safaris through lush forests teeming with elephants and tigers.",
    location: { type: "Point", coordinates: [76.6267, 11.6669] },
    thumbnailUrl: "https://images.unsplash.com/photo-1574768396010-863a8a30a7d5?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Murudeshwar Temple",
    district: "Uttara Kannada",
    city: "Murudeshwar",
    category: "TEMPLE",
    description: "Home to the world's second tallest Shiva statue, situated beautifully on a small hillock overlooking the Arabian Sea.",
    location: { type: "Point", coordinates: [74.4851, 14.0940] },
    thumbnailUrl: "https://images.unsplash.com/photo-1580132338692-0b8109bfcebe?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "MTR (Mavalli Tiffin Room)",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    category: "CAFE",
    description: "Legendary restaurant near Lalbagh founded in 1924, famous for authentic Rava Idli, Masala Dosa, and filter coffee.",
    location: { type: "Point", coordinates: [77.5855, 12.9566] },
    thumbnailUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000",
  },
  {
    name: "Hampi Ruins",
    district: "Vijayanagara",
    city: "Hampi",
    category: "HERITAGE",
    description: "UNESCO World Heritage Site containing the ruins of the magnificent ancient city of the Vijayanagara Empire.",
    location: { type: "Point", coordinates: [76.4600, 15.3350] },
    thumbnailUrl: "https://images.unsplash.com/photo-1620766165457-a80fe592170d?auto=format&fit=crop&q=80&w=1000",
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    
    console.log("Connected. Clearing existing places...");
    await Place.deleteMany({});
    
    console.log(`Inserting ${SEED_PLACES.length} places...`);
    await Place.insertMany(SEED_PLACES);
    
    console.log("Seed complete! Run 'npm run dev' and visit the map page.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();



*/


import mongoose, { Schema } from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const PlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, default: "Karnataka", trim: true },
    category: {
      type: String,
      enum: ["RESTAURANT", "CAFE", "STREET FOOD", "BAR", "NATURE", "HERITAGE", "TEMPLE", "BEACH", "WILDLIFE", "OTHER"],
      default: "OTHER",
    },
    description: { type: String, maxlength: 1000 },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    thumbnailUrl: { type: String },
    gallery: [{ type: String }],
    tags: [{ type: String, trim: true, lowercase: true }],
    contact: {
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
      googleMapsUrl: { type: String, trim: true },
    },
    metrics: {
      viewsCount: { type: Number, default: 0 },
      savesCount: { type: Number, default: 0 },
      rating: { type: Number, min: 1, max: 5 },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "APPROVED" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: "2dsphere" });
PlaceSchema.index({ name: "text", city: "text", district: "text", tags: "text" });
PlaceSchema.index({ name: 1, city: 1 }, { unique: true });
PlaceSchema.index({ category: 1, status: 1 });
PlaceSchema.index({ "metrics.savesCount": -1 });

const Place = mongoose.models.Place || mongoose.model("Place", PlaceSchema);

const SEED_PLACES = [
  {
    name: "Mysore Palace",
    district: "Mysuru",
    city: "Mysuru",
    state: "Karnataka",
    category: "HERITAGE",
    description: "A historical palace and a royal residence. It is the official residence of the Wadiyar dynasty and the seat of the Kingdom of Mysore.",
    location: { type: "Point", coordinates: [76.6552, 12.3051] },
    thumbnailUrl: "https://images.unsplash.com/photo-1600014798606-f6406e41b9c9?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },
  {
    name: "Jog Falls",
    district: "Shivamogga",
    city: "Sagara",
    state: "Karnataka",
    category: "NATURE",
    description: "The second-highest plunge waterfall in India, created by the Sharavathi River dropping 253 m, making it a major tourist attraction.",
    location: { type: "Point", coordinates: [74.8166, 14.229] },
    thumbnailUrl: "https://images.unsplash.com/photo-1627896472477-8d02c89dbd17?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },
  {
    name: "Gokarna Om Beach",
    district: "Uttara Kannada",
    city: "Gokarna",
    state: "Karnataka",
    category: "BEACH",
    description: "Famous for its Om shape, this pristine beach offers water sports, beachside cafes, and stunning sunset views.",
    location: { type: "Point", coordinates: [74.3188, 14.5186] },
    thumbnailUrl: "https://images.unsplash.com/photo-1590226343360-1436eb46ef27?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },
  {
    name: "Mylari Hotel (Original)",
    district: "Mysuru",
    city: "Mysuru",
    state: "Karnataka",
    category: "RESTAURANT",
    description: "Iconic eatery serving the famous melt-in-mouth Mylari dosa with a dollop of butter since the 1940s.",
    location: { type: "Point", coordinates: [76.6631, 12.3102] },
    thumbnailUrl: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },
  {
    name: "Bandipur National Park",
    district: "Chamarajanagar",
    city: "Bandipur",
    state: "Karnataka",
    category: "WILDLIFE",
    description: "One of India's best tiger reserves. Offers thrilling safaris through lush forests teeming with elephants and tigers.",
    location: { type: "Point", coordinates: [76.6267, 11.6669] },
    thumbnailUrl: "https://images.unsplash.com/photo-1574768396010-863a8a30a7d5?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },
  {
    name: "Murudeshwar Temple",
    district: "Uttara Kannada",
    city: "Murudeshwar",
    state: "Karnataka",
    category: "TEMPLE",
    description: "Home to the world's second tallest Shiva statue, situated beautifully on a small hillock overlooking the Arabian Sea.",
    location: { type: "Point", coordinates: [74.4851, 14.094] },
    thumbnailUrl: "https://images.unsplash.com/photo-1580132338692-0b8109bfcebe?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },
  {
    name: "MTR (Mavalli Tiffin Room)",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    state: "Karnataka",
    category: "CAFE",
    description: "Legendary restaurant near Lalbagh founded in 1924, famous for authentic Rava Idli, Masala Dosa, and filter coffee.",
    location: { type: "Point", coordinates: [77.5855, 12.9566] },
    thumbnailUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },
  {
    name: "Hampi Ruins",
    district: "Vijayanagara",
    city: "Hampi",
    state: "Karnataka",
    category: "HERITAGE",
    description: "UNESCO World Heritage Site containing the ruins of the magnificent ancient city of the Vijayanagara Empire.",
    location: { type: "Point", coordinates: [76.46, 15.335] },
    thumbnailUrl: "https://images.unsplash.com/photo-1620766165457-a80fe592170d?auto=format&fit=crop&q=80&w=1000",
    status: "APPROVED",
  },

  {
    name: "Rocky, Mayur go munching in Mangalore",
    city: "Mangalore",
    state: "Karnataka",
    category: "OTHER",
    description: "Location: Mangalore, Karnataka.",
    location: { type: "Point", coordinates: [74.856, 12.9141] },
    thumbnailUrl: "https://i.ytimg.com/vi/zvX1bVd5R7A/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBOPZecD0DwKjEtnUwxPibsctzoOw",
    status: "APPROVED",
  },
  {
    name: "Rocky enjoys seafood delicacies in Karwar",
    city: "Karwar",
    state: "Karnataka",
    category: "RESTAURANT",
    description: "Location: Karwar, Karnataka.",
    location: { type: "Point", coordinates: [74.1416, 14.8185] },
    thumbnailUrl: "https://i.ytimg.com/vi/wL2WmR4H3RY/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXfJdgfKbP_wjZp1xCX1E9BQ&rs=AOn4CLC1f_VfJdgfGkbP_wjZp1xCX1E9BQ",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur search for the alternative Udupi cuisine",
    city: "Udupi",
    state: "Karnataka",
    category: "RESTAURANT",
    description: "Location: Udupi, Karnataka.",
    location: { type: "Point", coordinates: [74.7421, 13.3409] },
    thumbnailUrl: "https://i.ytimg.com/vi/BJDfF4EaV-Q/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXwAcABBg==&rs=AOn4CLB6b4AiDTCk8CbwIsTOypxIX--RWw",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur taste the spices of Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    category: "RESTAURANT",
    description: "Location: Bengaluru, Karnataka.",
    location: { type: "Point", coordinates: [77.5946, 12.9716] },
    thumbnailUrl: "https://i.ytimg.com/vi/LPtxHWXmx04/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCQj-UX267pRR4z5dnH6Oh9RTqRQ",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur head to Mysore",
    city: "Mysore",
    state: "Karnataka",
    category: "HERITAGE",
    description: "Location: Mysore, Karnataka.",
    location: { type: "Point", coordinates: [76.6394, 12.2958] },
    thumbnailUrl: "https://i.ytimg.com/vi/Y6mSnv8cgDQ/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXwAcABBg==&rs=AOn4CLCcGuHllsh27nLR0GGNA3onVu84RA",
    status: "APPROVED",
  },
  {
    name: "Rocky and Mayur on their way to Madikeri",
    city: "Madikeri",
    state: "Karnataka",
    category: "OTHER",
    description: "Location: Madikeri, Karnataka.",
    location: { type: "Point", coordinates: [75.7382, 12.4244] },
    thumbnailUrl: "https://i.ytimg.com/vi/l28ZXm1J73I/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXgE2CNACELwBSFXwAcABBvABAfgBvgKAAvABigIMCAAQARhlIFUoWjAP&rs=AOn4CLDY8e-FdHODcdz0HiJt2FiV-nc9Rg",
    status: "APPROVED",
  },
  {
    name: "Bhatkally food on NDTV",
    city: "Bhatkal",
    state: "Karnataka",
    category: "STREET FOOD",
    description: "Location: Bhatkal, Karnataka.",
    location: { type: "Point", coordinates: [74.566, 13.9822] },
    thumbnailUrl: "https://i.ytimg.com/vi/6-_J3nE3ar8/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCDFIc3oaKoo79_eQ0z1N4ZRSDnQQ",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur celebrate Dussehra in Mysore",
    city: "Mysore",
    state: "Karnataka",
    category: "HERITAGE",
    description: "Location: Mysore, Karnataka.",
    location: { type: "Point", coordinates: [76.6394, 12.2958] },
    thumbnailUrl: "https://i.ytimg.com/vi/bDBOj_HZq0s/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXkq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBzzsIP8CZKdbBLOQjXkTdf7pIpUw",
    status: "APPROVED",
  },
  {
    name: "Rocky and Mayur on their way to Madikeri.flv",
    city: "Madikeri",
    state: "Karnataka",
    category: "OTHER",
    description: "Location: Madikeri, Karnataka.",
    location: { type: "Point", coordinates: [75.7382, 12.4244] },
    thumbnailUrl: "https://i.ytimg.com/vi/mn6CHl2xfT8/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXgBvgKAAvABigIMCAAQARhyIDooOzAP&rs=AOn4CLCaTrUWJQhtuaKZda3gjxqQQyAL3g",
    status: "APPROVED",
  },
  {
    name: "Sun, sand, sea and food in Goa",
    city: "Goa",
    state: "Goa",
    category: "RESTAURANT",
    description: "Location: Goa.",
    location: { type: "Point", coordinates: [74.124, 15.2993] },
    thumbnailUrl: "https://i.ytimg.com/vi/HSnRBnCJdBY/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXfUCYq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAR4pn7RMbFugnEkWySm529Sz9O-w",
    status: "APPROVED",
  },
  {
    name: "Rocky and mayur visit kolhapur 1",
    city: "Kolhapur",
    state: "Maharashtra",
    category: "RESTAURANT",
    description: "Location: Kolhapur, Maharashtra.",
    location: { type: "Point", coordinates: [74.2433, 16.705] },
    thumbnailUrl: "https://i.ytimg.com/vi/nbK7n5u3oXk/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXj4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCCqzo3lbHxVkgrD6zokqJA9nYLZw",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur get a taste of Malvani cuisine in Chiplun",
    city: "Chiplun",
    state: "Maharashtra",
    category: "RESTAURANT",
    description: "Location: Chiplun, Maharashtra.",
    location: { type: "Point", coordinates: [73.523, 17.5284] },
    thumbnailUrl: "https://i.ytimg.com/vi/UVlpJURS29g/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXj4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBrKg43osWi9WlH-9e8WsPk7yxoDQ",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur go fishing in Kannur",
    city: "Kannur",
    state: "Kerala",
    category: "OTHER",
    description: "Location: Kannur, Kerala.",
    location: { type: "Point", coordinates: [75.3704, 11.8745] },
    thumbnailUrl: "https://i.ytimg.com/vi/9CG3e01TqM4/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXuADigIMCAAQARh_IDAoHDAP&rs=AOn4CLCDFIc3oaKoo79_eQ0z1N4ZRSDnQQ",
    status: "APPROVED",
  },
  {
    name: "Eating out in Ernakulam",
    city: "Ernakulam",
    state: "Kerala",
    category: "RESTAURANT",
    description: "Location: Ernakulam, Kerala.",
    location: { type: "Point", coordinates: [76.2999, 9.9816] },
    thumbnailUrl: "https://i.ytimg.com/vi/-sofzTb3Z40/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXgB_gKAAqACigIMCAAQARhlIFAoPTAP&rs=AOn4CLDBPf0_3th7DR4T02BNRAutULNH5g",
    status: "APPROVED",
  },
  {
    name: "Andhra delicacies that left our highwaymen smacking their lips",
    city: "Andhra Pradesh",
    state: "Andhra Pradesh",
    category: "RESTAURANT",
    description: "Location: Andhra Pradesh.",
    location: { type: "Point", coordinates: [79.74, 15.9129] },
    thumbnailUrl: "https://i.ytimg.com/vi/6tazV4JLR6Q/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXuADigIMCAAQARhyIEcoPzAP&rs=AOn4CLBMhCxN5d8etdivPuMUZKGw0GcQcA",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur go on an adventure trip in Nellore",
    city: "Nellore",
    state: "Andhra Pradesh",
    category: "OTHER",
    description: "Location: Nellore, Andhra Pradesh.",
    location: { type: "Point", coordinates: [79.9865, 14.4426] },
    thumbnailUrl: "https://i.ytimg.com/vi/2Jl6PZCyohY/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXgBvgKAAvABigIMCAAQARhlIFUoWjAP&rs=AOn4CLCuHjjedkfi_gX8pW7wnziXDHzorw",
    status: "APPROVED",
  },
  {
    name: "Chennai's culinary delights",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "RESTAURANT",
    description: "Location: Chennai, Tamil Nadu.",
    location: { type: "Point", coordinates: [80.2707, 13.0827] },
    thumbnailUrl: "https://i.ytimg.com/vi/75Dql4Us4HE/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXuADigIMCAAQARhyIEcoPzAP&rs=AOn4CLBMhCxN5d8etdivPuMUZKGw0GcQcA",
    status: "APPROVED",
  },
  {
    name: "Rocky and Mayur get a taste of Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    category: "RESTAURANT",
    description: "Location: Mumbai, Maharashtra.",
    location: { type: "Point", coordinates: [72.8777, 19.076] },
    thumbnailUrl: "https://i.ytimg.com/vi/OERt9M9cQno/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXDdfy_x955Vw&rs=AOn4CLAt_7pSk8TShBxLgDSX-dy_x955Vw",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur enjoy a relaxed meal in Shrivardhan",
    city: "Shrivardhan",
    state: "Maharashtra",
    category: "RESTAURANT",
    description: "Location: Shrivardhan, Maharashtra.",
    location: { type: "Point", coordinates: [73.0221, 18.0416] },
    thumbnailUrl: "https://i.ytimg.com/vi/TxNXdo-Ut5I/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXgNqkqJA9nYLZw&rs=AOn4CLBC_OCTG_nUlUlVrnkQpsD1IgvAig",
    status: "APPROVED",
  },
  {
    name: "Pune beckons the Highwaymen once again",
    city: "Pune",
    state: "Maharashtra",
    category: "RESTAURANT",
    description: "Location: Pune, Maharashtra.",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    thumbnailUrl: "https://i.ytimg.com/vi/BsbmkqjYJD4/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXfUCyq4qpAw4IARUAAIhCGAFwAcABBvABAfgBvgKAAvABigIMCAAQARhlIFUoWjAP&rs=AOn4CLB0nsDFuKwUhpW6BPGUKes3zX5vXw",
    status: "APPROVED",
  },
  {
    name: "Fish fry, coffee and more in Kerala",
    city: "Kerala",
    state: "Kerala",
    category: "RESTAURANT",
    description: "Location: Kerala.",
    location: { type: "Point", coordinates: [76.2711, 10.8505] },
    thumbnailUrl: "https://i.ytimg.com/vi/rysq61RldcI/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXuADigIMCAAQARhlIFAoPTAP&rs=AOn4CLCZyCKueCKheVSzanNNd0jHEnLqEQ",
    status: "APPROVED",
  },
  {
    name: "Rocky, Mayur's delectable delights in Thiruvananthapuram",
    city: "Thiruvananthapuram",
    state: "Kerala",
    category: "RESTAURANT",
    description: "Location: Thiruvananthapuram, Kerala.",
    location: { type: "Point", coordinates: [76.9366, 8.5241] },
    thumbnailUrl: "https://i.ytimg.com/vi/ittJ-4OLtYg/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXfUcnygXkg&rs=AOn4CLCUcnOepkvQLTRWxwtbdgtqmpgXkg",
    status: "APPROVED",
  },
  {
    name: "Calicut style appetite",
    city: "Calicut",
    state: "Kerala",
    category: "RESTAURANT",
    description: "Location: Calicut, Kerala.",
    location: { type: "Point", coordinates: [75.7804, 11.2588] },
    thumbnailUrl: "https://i.ytimg.com/vi/gCloER7y4eY/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXmac2qE-nVAvWMt4_oHw&rs=AOn4CLAZcRBVEexmac2qE-nVAvWMt4_oHw",
    status: "APPROVED",
  },
  {
    name: "NDTV Goodtimes to RK Group of Hotels Machilipatnam",
    city: "Machilipatnam",
    state: "Andhra Pradesh",
    category: "RESTAURANT",
    description: "Location: Machilipatnam, Andhra Pradesh.",
    location: { type: "Point", coordinates: [81.1309, 16.1782] },
    thumbnailUrl: "https://i.ytimg.com/vi/zqydAGfgfSA/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXf44tm-AzR_hWlyDUxCBRbjDLOA&rs=AOn4CLBXf44tm-AzR_hWlyDUxCBRbjDLOA",
    status: "APPROVED",
  },
  {
    name: "On A Culinary Journey In Goa | HOMP Goes To Goa",
    city: "Goa",
    state: "Goa",
    category: "RESTAURANT",
    description: "Location: Goa.",
    location: { type: "Point", coordinates: [74.124, 15.2993] },
    thumbnailUrl: "https://i.ytimg.com/vi/0U69VcZ4dVo/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXuADigIMCAAQARhyIEcoPzAP&rs=AOn4CLBMhCxN5d8etdivPuMUZKGw0GcQcA",
    status: "APPROVED",
  },
  {
    name: "It never stops raining in Coonoor",
    city: "Coonoor",
    state: "Tamil Nadu",
    category: "OTHER",
    description: "Location: Coonoor, Tamil Nadu.",
    location: { type: "Point", coordinates: [76.7959, 11.353] },
    thumbnailUrl: "https://i.ytimg.com/vi/nSa3CV9GC3g/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXuADigIMCAAQARgcIFsofzAP&rs=AOn4CLDBOd7cZc-NdWBMbWEKL10NKiNkog",
    status: "APPROVED",
  },
  {
    name: "Highwaymen taste Vietnamese food in Puducherry",
    city: "Puducherry",
    state: "Puducherry",
    category: "RESTAURANT",
    description: "Location: Puducherry.",
    location: { type: "Point", coordinates: [79.8083, 11.9416] },
    thumbnailUrl: "https://i.ytimg.com/vi/XYlAJhfXfZM/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXuADigIMCAAQARhlIFAoPTAP&rs=AOn4CLBnIaXa-NxDg8Z3ifBGcXiEN6jrvQ",
    status: "APPROVED",
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected. Clearing existing places...");
    await Place.deleteMany({});
    console.log(`Inserting ${SEED_PLACES.length} places...`);
    await Place.insertMany(SEED_PLACES, { ordered: false });
    console.log("Seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();