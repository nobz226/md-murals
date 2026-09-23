import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    if (!settings) {
      // Return defaults if not set
      return DEFAULT_SETTINGS;
    }
    return settings;
  },
});

// Update gallery settings
export const updateGallerySettings = mutation({
  args: {
    tileSize: v.optional(v.number()),
    rows: v.optional(v.number()),
    cols: v.optional(v.number()),
    startPosition: v.optional(v.union(v.literal("left"), v.literal("center"), v.literal("right"))),
    enableTileHoverZoom: v.optional(v.boolean()),
    enableImageHoverZoom: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("gallerySettings").first();
    
    const updates = { updatedAt: now };
    if (args.tileSize !== undefined) updates.tileSize = args.tileSize;
    if (args.rows !== undefined) updates.rows = args.rows;
    if (args.cols !== undefined) updates.cols = args.cols;
    if (args.startPosition !== undefined) updates.startPosition = args.startPosition;
    if (args.enableTileHoverZoom !== undefined) updates.enableTileHoverZoom = args.enableTileHoverZoom;
    if (args.enableImageHoverZoom !== undefined) updates.enableImageHoverZoom = args.enableImageHoverZoom;

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      // Return updated settings without createdAt
      const { createdAt, ...rest } = existing;
      return { ...rest, ...updates };
    } else {
      const id = await ctx.db.insert("gallerySettings", {
        ...DEFAULT_SETTINGS,
        ...updates,
        createdAt: now,
      });
      return { _id: id, ...DEFAULT_SETTINGS, ...updates };
    }
  },
});

// Reset to defaults
export const resetGallerySettings = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("gallerySettings").first();
    const now = Date.now();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...DEFAULT_SETTINGS,
        updatedAt: now,
      });
      return { ...existing, ...DEFAULT_SETTINGS, updatedAt: now };
    } else {
      const id = await ctx.db.insert("gallerySettings", {
        ...DEFAULT_SETTINGS,
        createdAt: now,
        updatedAt: now,
      });
      return { _id: id, ...DEFAULT_SETTINGS };
    }
  },
});