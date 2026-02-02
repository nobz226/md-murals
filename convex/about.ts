import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get about data (should only be one record)
export const getAbout = query({
  args: {},
  handler: async (ctx) => {
    const about = await ctx.db.query("about").first();
    if (!about) return null;
    
    // Normalize field names for backwards compatibility
    return {
      _id: about._id,
      _creationTime: about._creationTime,
      title: about.title || "Artist Name",
      bio: about.bio || about.bioText || "",
      storageId: about.storageId || about.imageStorageId,
      url: about.url || about.imageUrl || "",
    };
  },
});

// Update or create about data
export const updateAbout = mutation({
  args: {
    title: v.string(),
    bio: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("about").first();

    // Generate URL from storageId if provided
    let url = "";
    if (args.storageId) {
      const urlResult = await ctx.storage.getUrl(args.storageId);
      url = urlResult || "";
    } else if (existing?.storageId) {
      const urlResult = await ctx.storage.getUrl(existing.storageId);
      url = urlResult || "";
    } else if (existing?.imageStorageId) {
      const urlResult = await ctx.storage.getUrl(existing.imageStorageId);
      url = urlResult || "";
    }

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        title: args.title,
        bio: args.bio,
        bioText: args.bio, // Keep both for backwards compatibility
        ...(args.storageId && { 
          storageId: args.storageId,
          imageStorageId: args.storageId 
        }),
        url: url,
        imageUrl: url,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new record
      const id = await ctx.db.insert("about", {
        title: args.title,
        bio: args.bio,
        bioText: args.bio,
        storageId: args.storageId,
        imageStorageId: args.storageId,
        url: url,
        imageUrl: url,
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

// Generate upload URL for about image
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
