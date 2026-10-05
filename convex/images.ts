import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { adminKeyArg, assertAdmin } from "./adminAuth";

// Generate upload URL for image
export const generateUploadUrl = mutation({
  args: adminKeyArg,
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.storage.generateUploadUrl();
  },
});

// Save image after upload. The project's first image becomes its featured image.
export const saveImage = mutation({
  args: {
    ...adminKeyArg,
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const url = await ctx.storage.getUrl(args.storageId);
    const existing = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const maxOrder = existing.reduce((max, img) => Math.max(max, img.order), -1);
    const isFirst = existing.length === 0;

    const imageId = await ctx.db.insert("images", {
      projectId: args.projectId,
      storageId: args.storageId,
      isFeatured: isFirst,
      order: maxOrder + 1,
      url: url || "",
    });

    if (isFirst) {
      await ctx.db.patch(args.projectId, { featuredImageId: imageId, updatedAt: Date.now() });
    }

    return imageId;
  },
});

// Get images for a project, in display order
export const getProjectImages = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return images.sort((a, b) => a.order - b.order);
  },
});

// Delete image. If it was featured, the next image takes its place.
export const deleteImage = mutation({
  args: { ...adminKeyArg, imageId: v.id("images") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const image = await ctx.db.get(args.imageId);
    if (!image) return;

    if (image.storageId) {
      await ctx.storage.delete(image.storageId);
    }
    await ctx.db.delete(args.imageId);

    const project = await ctx.db.get(image.projectId);
    if (project && project.featuredImageId === args.imageId) {
      const remaining = await ctx.db
        .query("images")
        .withIndex("by_project", (q) => q.eq("projectId", image.projectId))
        .collect();
      const next = remaining.sort((a, b) => a.order - b.order)[0];
      if (next) {
        await ctx.db.patch(next._id, { isFeatured: true });
      }
      await ctx.db.patch(project._id, {
        featuredImageId: next?._id,
        updatedAt: Date.now(),
      });
    }
  },
});

// Reorder images: ids in their new display order
export const reorderImages = mutation({
  args: {
    ...adminKeyArg,
    imageIds: v.array(v.id("images")),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    for (let i = 0; i < args.imageIds.length; i++) {
      await ctx.db.patch(args.imageIds[i], { order: i });
    }
  },
});
