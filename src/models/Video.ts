/*&
import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    title:              { type: String, required: true, trim: true, maxlength: 100 },
    description:        { type: String, required: true, maxlength: 500 },
    category:           { type: String, enum: ["NATURE","HERITAGE","FOOD","TREKKING","WATERFALL","CULTURE","HIDDEN_GEM","TEMPLE","BEACH","WILDLIFE"], required: true },
    tags:               [{ type: String, trim: true }],
    placeName:          { type: String, required: true, trim: true },
    district:           { type: String, required: true },
    latitude:           { type: Number },
    longitude:          { type: Number },
    videoUrl:           { type: String, required: true },
    thumbnailUrl:       { type: String },
    cloudinaryPublicId: { type: String, required: true },
    creatorId:          { type: Schema.Types.ObjectId, ref: "User", required: true },
    status:             { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING" },
    rejectionReason:    { type: String },
    views:              { type: Number, default: 0 },
    likesCount:         { type: Number, default: 0 },
    commentsCount:      { type: Number, default: 0 },
    sharesCount:        { type: Number, default: 0 },
    savesCount:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

VideoSchema.index({ status: 1, createdAt: -1 });
VideoSchema.index({ creatorId: 1, status: 1 });
VideoSchema.index({ district: 1, status: 1 });
VideoSchema.index({ category: 1, status: 1 });
// Geo index for nearby queries
VideoSchema.index({ latitude: 1, longitude: 1 });

export const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);
*/


/* NEW */


/*
import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    title:              { type: String, required: true, trim: true, maxlength: 100 },
    description:        { type: String, maxlength: 500 },

    // Categories (can be reused for food, nature, etc.)
    category:           { 
      type: String, 
      enum: [
        "NATURE","HERITAGE","FOOD","TREKKING","WATERFALL",
        "CULTURE","HIDDEN_GEM","TEMPLE","BEACH","WILDLIFE","RESTAURANT"
      ], 
      required: true 
    },
    tags:               [{ type: String, trim: true }],

    // Link to Place schema (normalized design)
    placeId:            { type: Schema.Types.ObjectId, ref: "Place", required: true },

    // Video sources (either YouTube or Cloudinary)
    youtubeUrl:         { type: String },              // for playlist imports
    videoUrl:           { type: String },              // for Cloudinary uploads
    thumbnailUrl:       { type: String },
    cloudinaryPublicId: { type: String },              // only for Cloudinary uploads

    // Creator info
    creatorId:          { type: Schema.Types.ObjectId, ref: "User" },

    // Moderation
    status:             { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING" },
    rejectionReason:    { type: String },

    // Engagement metrics
    views:              { type: Number, default: 0 },
    likesCount:         { type: Number, default: 0 },
    commentsCount:      { type: Number, default: 0 },
    sharesCount:        { type: Number, default: 0 },
    savesCount:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Useful indexes
VideoSchema.index({ status: 1, createdAt: -1 });
VideoSchema.index({ creatorId: 1, status: 1 });
VideoSchema.index({ category: 1, status: 1 });
VideoSchema.index({ placeId: 1, status: 1 });

export const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);


*/



/* NEWER */


import mongoose, { Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },

    category: {
      type: String,
      enum: [
        "NATURE",
        "HERITAGE",
        "FOOD",
        "TREKKING",
        "WATERFALL",
        "CULTURE",
        "HIDDEN_GEM",
        "TEMPLE",
        "BEACH",
        "WILDLIFE",
        "RESTAURANT",
      ],
      required: true,
    },

    tags: [{ type: String, trim: true }],

    placeId: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      index: true,
    },

    youtubeUrl: { type: String },
    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    cloudinaryPublicId: { type: String },

    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    rejectionReason: { type: String },

    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

VideoSchema.index({ status: 1, createdAt: -1 });
VideoSchema.index({ creatorId: 1, status: 1 });
VideoSchema.index({ category: 1, status: 1 });
VideoSchema.index({ placeId: 1, status: 1 });

export const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);