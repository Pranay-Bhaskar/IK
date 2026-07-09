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
