// src/models/Media.ts
import mongoose, { Schema } from "mongoose";

const MediaSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["video", "image"],
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ["cloudinary", "youtube"],
      required: true,
      index: true,
    },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    title: { type: String, trim: true, maxlength: 160 },
    description: { type: String, maxlength: 1000 },
    durationSeconds: { type: Number },
    publicId: { type: String },
    youtubeVideoId: { type: String },
    youtubePlaylistId: { type: String },
    youtubeChannelId: { type: String },
    placeId: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
      index: true,
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

MediaSchema.index({ placeId: 1, createdAt: -1 });
MediaSchema.index({ status: 1, createdAt: -1 });
MediaSchema.index({ type: 1, sourceType: 1 });

export const Media = mongoose.models.Media || mongoose.model("Media", MediaSchema);