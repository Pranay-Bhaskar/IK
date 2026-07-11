'use client';

import React, { useEffect, useState } from 'react';
import MediaPlayer from './MediaPlayer';
import { X } from 'lucide-react';

interface PlaceGalleryProps {
  placeId: string;
  placeName: string;
  onClose: () => void;
}

export default function PlaceGallery({ placeId, placeName, onClose }: PlaceGalleryProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/places/${placeId}/gallery`);
        const data = await res.json();
        if (data.success) {
          setMedia(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch gallery', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [placeId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col backdrop-blur-md">
      <div className="flex justify-between items-center p-4 text-white">
        <h2 className="text-xl font-bold">{placeName} - Gallery</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedMedia ? (
          <div className="w-full h-full flex flex-col items-center">
            <button 
              className="mb-4 text-sm bg-white/20 px-4 py-2 rounded-full text-white"
              onClick={() => setSelectedMedia(null)}
            >
              Back to Grid
            </button>
            <div className="w-full max-w-2xl h-[70vh] rounded-xl overflow-hidden bg-black">
              <MediaPlayer
                type={selectedMedia.type}
                sourceType={selectedMedia.sourceType}
                url={selectedMedia.url}
                thumbnailUrl={selectedMedia.thumbnailUrl}
              />
            </div>
            {selectedMedia.title && <p className="mt-4 text-white font-medium">{selectedMedia.title}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center text-white p-10">Loading gallery...</div>
            ) : media.length === 0 ? (
              <div className="col-span-full text-center text-white/60 p-10">No media available for this location.</div>
            ) : (
              media.map((item) => (
                <div 
                  key={item._id} 
                  className="aspect-[3/4] relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition group"
                  onClick={() => setSelectedMedia(item)}
                >
                  <img 
                    src={item.thumbnailUrl || (item.type === 'image' ? item.url : '/placeholder.jpg')} 
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white bg-black/60 px-3 py-1 rounded-full text-xs uppercase tracking-widest">View</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
