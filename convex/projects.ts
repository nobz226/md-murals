import { query, mutation, QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { adminKeyArg, assertAdmin } from "./adminAuth";

const categoryValidator = v.union(
  v.literal("interior"),
  v.literal("exterior"),
  v.literal("canvas")
);

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

// Attach the featured image to a project, falling back to its first image
async function withFeaturedImage(ctx: QueryCtx, project: Doc<"projects">) {
  let featuredImage = project.featuredImageId
    ? await ctx.db.get(project.featuredImageId)
    : null;

  if (!featuredImage) {
    const images = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    featuredImage = images.sort(byOrder)[0] || null;
  }

  return { ...project, featuredImage };
}

// Get all projects with their featured images
export const getAllProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return Promise.all(projects.sort(byOrder).map((p) => withFeaturedImage(ctx, p)));
  },
});

// Get projects by category
export const getProjectsByCategory = query({
  args: { category: categoryValidator },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    return Promise.all(projects.sort(byOrder).map((p) => withFeaturedImage(ctx, p)));
  },
});

// Admin list: projects with featured image and image count
export const getAdminProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return Promise.all(
      projects.sort(byOrder).map(async (project) => {
        const images = await ctx.db
          .query("images")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        const withImage = await withFeaturedImage(ctx, project);
        return { ...withImage, imageCount: images.length };
      })
    );
  },
});

// Get single project with all images
export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const images = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    return {
      ...project,
      images: images.sort(byOrder),
    };
  },
});

// Create project (appended to the end of the order)
export const createProject = mutation({
  args: {
    ...adminKeyArg,
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const now = Date.now();
    const projects = await ctx.db.query("projects").collect();
    const maxOrder = projects.reduce((max, p) => Math.max(max, p.order), -1);

    return await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      category: args.category,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update project
export const updateProject = mutation({
  args: {
    ...adminKeyArg,
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(categoryValidator),
  },
  handler: async (ctx, args) => {
    const { adminKey, id, ...updates } = args;
    assertAdmin(adminKey);
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Reorder projects: ids in their new display order
export const reorderProjects = mutation({
  args: {
    ...adminKeyArg,
    projectIds: v.array(v.id("projects")),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    for (let i = 0; i < args.projectIds.length; i++) {
      await ctx.db.patch(args.projectIds[i], { order: i });
    }
  },
});

// Delete project
export const deleteProject = mutation({
  args: { ...adminKeyArg, id: v.id("projects") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    // Delete all images associated with project
    const images = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const image of images) {
      if (image.storageId) {
        await ctx.storage.delete(image.storageId);
      }
      await ctx.db.delete(image._id);
    }

    await ctx.db.delete(args.id);
  },
});

// Set featured image for project
export const setFeaturedImage = mutation({
  args: {
    ...adminKeyArg,
    projectId: v.id("projects"),
    imageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    // Update all images for this project to not be featured
    const images = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const image of images) {
      await ctx.db.patch(image._id, { isFeatured: image._id === args.imageId });
    }

    // Update project's featured image reference
    await ctx.db.patch(args.projectId, {
      featuredImageId: args.imageId,
      updatedAt: Date.now(),
    });
  },
});
