import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all sounds
export const getAllSounds = query({
  handler: async (ctx) => {
    const sounds = await ctx.db.query("sounds").collect();
    return sounds;
  },
});

// Get sound by type
export const getSoundByType = query({
  args: { 
    type: v.union(
      v.literal("click"),
      v.literal("open"),
      v.literal("close"),
      v.literal("zoom-in"),
      v.literal("zoom-out"),
      v.literal("drag-start"),
      v.literal("drag-end")
    )
  },
  handler: async (ctx, args) => {
    const sound = await ctx.db
      .query("sounds")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();
    return sound;
  },
});

// Generate upload URL for sound
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Save or update sound
export const saveSound = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("click"),
      v.literal("open"),
      v.literal("close"),
      v.literal("zoom-in"),
      v.literal("zoom-out"),
      v.literal("drag-start"),
      v.literal("drag-end")
    ),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    
    // Check if sound of this type already exists
    const existing = await ctx.db
      .query("sounds")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();

    if (existing) {
      // Delete old file and update record
      if (existing.storageId) {
        await ctx.storage.delete(existing.storageId);
      }
      await ctx.db.patch(existing._id, {
        name: args.name,
        storageId: args.storageId,
        url: url || "",
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new record
      const soundId = await ctx.db.insert("sounds", {
        name: args.name,
        type: args.type,
        storageId: args.storageId,
        url: url || "",
        updatedAt: Date.now(),
      });
      return soundId;
    }
  },
});

// Delete sound
export const deleteSound = mutation({
  args: { soundId: v.id("sounds") },
  handler: async (ctx, args) => {
    const sound = await ctx.db.get(args.soundId);
    if (!sound) return;
    
    // Only delete from storage if it has a storageId (uploaded files)
    if (sound.storageId) {
      await ctx.storage.delete(sound.storageId);
    }
    await ctx.db.delete(args.soundId);
  },
});
