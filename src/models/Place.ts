/* 
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
*/

/*
import mongoose, { Schema } from "mongoose";

const PlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140, index: true },
    slug: { type: String, trim: true, index: true },
    address: { type: String, trim: true },
    district: { type: String, trim: true, index: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true, default: "Karnataka", index: true },
    category: {
      type: String,
      enum: ["RESTAURANT", "CAFE", "STREET FOOD", "BAR", "NATURE", "HERITAGE", "TEMPLE", "BEACH", "WILDLIFE", "OTHER"],
      default: "OTHER",
      index: true,
    },
    description: { type: String, maxlength: 1000 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => Array.isArray(v) && v.length === 2,
          message: "coordinates must be [lng, lat]",
        },
      },
    },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    thumbnailUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "APPROVED", index: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: "2dsphere" });
PlaceSchema.index({ name: "text", city: "text", district: "text" });
PlaceSchema.index({ name: 1, city: 1 });

PlaceSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, "-");
  }
});

export const Place = mongoose.models.Place || mongoose.model("Place", PlaceSchema);

*/

// src/models/Place.ts
import mongoose, { Schema } from "mongoose";

const PlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140, index: true },
    slug: { type: String, trim: true, index: true },
    address: { type: String, trim: true },
    district: { type: String, trim: true, index: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true, default: "Karnataka", index: true },
    category: {
      type: String,
      enum: ["RESTAURANT", "CAFE", "STREET FOOD", "BAR", "NATURE", "HERITAGE", "TEMPLE", "BEACH", "WILDLIFE", "OTHER"],
      default: "OTHER",
      index: true,
    },
    description: { type: String, maxlength: 1000 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => Array.isArray(v) && v.length === 2,
          message: "coordinates must be [lng, lat]",
        },
      },
    },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    thumbnailUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "APPROVED", index: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: "2dsphere" });
PlaceSchema.index({ name: "text", city: "text", district: "text" });
PlaceSchema.index({ name: 1, city: 1 });

PlaceSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, "-");
  }
});

export const Place = mongoose.models.Place || mongoose.model("Place", PlaceSchema);