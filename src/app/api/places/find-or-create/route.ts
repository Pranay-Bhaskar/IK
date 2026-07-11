import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Place } from "@/models/Place";

export async function POST(req: Request) {
  await connectDB();
  const { name, district, category } = await req.json();
  
  let place = await Place.findOne({ name, district });
  if (!place) {
    place = await Place.create({ name, district, category });
  }
  return NextResponse.json({ data: place });
}