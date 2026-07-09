import mongoose, { Schema } from "mongoose";

const PlaceSchema = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    district:    { type: String },
    city:        { type: String },
    state:       { type: String },
    category:    { type: String, enum: ["RESTAURANT","CAFE","STREET FOOD","BAR","NATURE","HERITAGE","TEMPLE","BEACH","WILDLIFE","OTHER"] },
    description: { type: String },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }
    },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: "2dsphere" });

export const Place = mongoose.models.Place || mongoose.model("Place", PlaceSchema);