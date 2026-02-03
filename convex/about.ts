import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get about page data (there should only be one record)
export const getAbout = query({
  handler: async (ctx) => {
    const about = await ctx.db.query("about").first();
    if (!about) return null;
    
    // Handle backwards compatibility - prefer new field names
    return {
      ...about,
      bio: about.bio || about.bioText,
      storageId: about.storageId || about.imageStorageId,
    };
  },
});

// Update or create about page data
export const updateAbout = mutation({
  args: {
    title: v.optional(v.string()),
    bioTitle: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("about").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        bioTitle: args.bioTitle,
        bio: args.bio,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("about", {
        title: args.title,
        bioTitle: args.bioTitle,
        bio: args.bio,
        updatedAt: now,
      });
    }
  },
});

// Generate upload URL for featured image
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Save featured image
export const saveFeaturedImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("about").first();
    const url = await ctx.storage.getUrl(args.storageId);
    const now = Date.now();

    if (existing) {
      // Delete old image if exists
      if (existing.storageId) {
        await ctx.storage.delete(existing.storageId);
      }
      
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        imageUrl: url,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("about", {
        storageId: args.storageId,
        imageUrl: url,
        updatedAt: now,
      });
    }
  },
});
