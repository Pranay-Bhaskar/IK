import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from "mongoose";

async function testConnection() {
  try {
    console.log("Attempting to connect to:", process.env.MONGODB_URI?.split('@')[1]); // Safe log
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connection Successful!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Connection Failed:", error);
  }
}
testConnection();