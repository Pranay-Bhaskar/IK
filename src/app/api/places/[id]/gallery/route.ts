import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Place } from '@/models/Place';
import { Media } from '@/models/Media';

// Fix: params is typed as a Promise
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Ensure Media is registered
    const _ = Media;

    // Fix: Await the params object before accessing id
    const resolvedParams = await params;
    const placeId = resolvedParams.id;
    
    const place = await Place.findById(placeId).populate({
      path: 'gallery',
      options: { sort: { createdAt: -1 } },
    });

    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: place.gallery,
    });
  } catch (error: any) {
    console.error('Place Gallery API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}