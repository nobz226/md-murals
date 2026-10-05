import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { adminKeyArg, assertAdmin } from "./adminAuth";

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
    ...adminKeyArg,
    title: v.optional(v.string()),
    bioTitle: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const existing = await ctx.db.query("about").first();
    const fields = {
      title: args.title,
      bioTitle: args.bioTitle,
      bio: args.bio,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    }
    return await ctx.db.insert("about", fields);
  },
});

// Generate upload URL for featured image
export const generateUploadUrl = mutation({
  args: adminKeyArg,
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.storage.generateUploadUrl();
  },
});

// Save featured image
export const saveFeaturedImage = mutation({
  args: {
    ...adminKeyArg,
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const existing = await ctx.db.query("about").first();
    const imageUrl = (await ctx.storage.getUrl(args.storageId)) ?? undefined;
    const now = Date.now();

    if (existing) {
      // Delete old image (including the legacy field) if it exists
      const oldStorageId = existing.storageId || existing.imageStorageId;
      if (oldStorageId) {
        await ctx.storage.delete(oldStorageId);
      }

      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        imageStorageId: undefined,
        imageUrl,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("about", {
      storageId: args.storageId,
      imageUrl,
      updatedAt: now,
    });
  },
});
