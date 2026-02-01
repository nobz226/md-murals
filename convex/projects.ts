import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all projects with their featured images
export const getAllProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    
    const projectsWithImages = await Promise.all(
      projects.map(async (project) => {
        let featuredImage = project.featuredImageId
          ? await ctx.db.get(project.featuredImageId)
          : null;
        
        // If no featured image set, get the first image for this project
        if (!featuredImage) {
          const images = await ctx.db
            .query("images")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .first();
          featuredImage = images || null;
        }
        
        return {
          ...project,
          featuredImage,
        };
      })
    );
    
    return projectsWithImages;
  },
});

// Get projects by category
export const getProjectsByCategory = query({
  args: { category: v.union(v.literal("interior"), v.literal("exterior"), v.literal("canvas")) },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    
    const projectsWithImages = await Promise.all(
      projects.map(async (project) => {
        const featuredImage = project.featuredImageId
          ? await ctx.db.get(project.featuredImageId)
          : null;
        
        return {
          ...project,
          featuredImage,
        };
      })
    );
    
    return projectsWithImages;
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
      images,
    };
  },
});

// Create project
export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(v.literal("interior"), v.literal("exterior"), v.literal("canvas")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const count = await ctx.db.query("projects").collect();
    
    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      category: args.category,
      order: count.length,
      createdAt: now,
      updatedAt: now,
    });
    
    return projectId;
  },
});

// Update project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(v.literal("interior"), v.literal("exterior"), v.literal("canvas"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete project
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Delete all images associated with project
    const images = await ctx.db
      .query("images")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    
    for (const image of images) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(image._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

// Set featured image for project
export const setFeaturedImage = mutation({
  args: {
    projectId: v.id("projects"),
    imageId: v.id("images"),
  },
  handler: async (ctx, args) => {
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
