import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for image
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Save image after upload
export const saveImage = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    
    const imageId = await ctx.db.insert("images", {
      projectId: args.projectId,
      storageId: args.storageId,
      isFeatured: false,
      order: args.order,
      url: url || "",
    });
    
    return imageId;
  },
});

// Get images for a project
export const getProjectImages = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    return images;
  },
});

// Delete image
export const deleteImage = mutation({
  args: { imageId: v.id("images") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) return;
    
    await ctx.storage.delete(image.storageId);
    await ctx.db.delete(args.imageId);
  },
});

// Reorder images
export const reorderImages = mutation({
  args: {
    imageIds: v.array(v.id("images")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.imageIds.length; i++) {
      await ctx.db.patch(args.imageIds[i], { order: i });
    }
  },
});
