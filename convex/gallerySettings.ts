import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { adminKeyArg, assertAdmin } from "./adminAuth";

const DEFAULT_SETTINGS = {
  tileSize: 320,
  rows: 3,
  cols: 13,
  startPosition: "left" as const,
  enableTileHoverZoom: true,
  enableImageHoverZoom: true,
};

// Get gallery settings (single record)
export const getGallerySettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("gallerySettings").first();
    // Return defaults if not set
    return settings ?? DEFAULT_SETTINGS;
  },
});

// Update gallery settings
export const updateGallerySettings = mutation({
  args: {
    ...adminKeyArg,
    tileSize: v.optional(v.number()),
    rows: v.optional(v.number()),
    cols: v.optional(v.number()),
    startPosition: v.optional(v.union(v.literal("left"), v.literal("center"), v.literal("right"))),
    enableTileHoverZoom: v.optional(v.boolean()),
    enableImageHoverZoom: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { adminKey, ...fields } = args;
    assertAdmin(adminKey);
    const now = Date.now();
    const existing = await ctx.db.query("gallerySettings").first();

    // Drop fields that weren't provided
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined)
    ) as Partial<typeof fields>;

    if (existing) {
      await ctx.db.patch(existing._id, { ...updates, updatedAt: now });
      return { ...existing, ...updates, updatedAt: now };
    }
    const doc = { ...DEFAULT_SETTINGS, ...updates, createdAt: now, updatedAt: now };
    const id = await ctx.db.insert("gallerySettings", doc);
    return { _id: id, ...doc };
  },
});

// Reset to defaults
export const resetGallerySettings = mutation({
  args: adminKeyArg,
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const existing = await ctx.db.query("gallerySettings").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { ...DEFAULT_SETTINGS, updatedAt: now });
      return { ...existing, ...DEFAULT_SETTINGS, updatedAt: now };
    }
    const doc = { ...DEFAULT_SETTINGS, createdAt: now, updatedAt: now };
    const id = await ctx.db.insert("gallerySettings", doc);
    return { _id: id, ...doc };
  },
});
