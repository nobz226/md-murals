import { mutation } from "./_generated/server";

export const clearData = mutation({
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const images = await ctx.db.query("images").collect();
    
    for (const image of images) {
      if (image.storageId) {
        await ctx.storage.delete(image.storageId);
      }
      await ctx.db.delete(image._id);
    }
    
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }
    
    return { success: true, message: `Cleared ${projects.length} projects and ${images.length} images` };
  },
});

export const seedData = mutation({
  handler: async (ctx) => {
    // Check if we already have projects
    const existing = await ctx.db.query("projects").first();
    if (existing) {
      return { success: false, message: "Database already has projects" };
    }

    // Create sample projects for each category
    const now = Date.now();
    
    const interiorProject = await ctx.db.insert("projects", {
      title: "Modern Living Room Mural",
      description: "A contemporary geometric design bringing life to interior spaces",
      category: "interior",
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    const exteriorProject = await ctx.db.insert("projects", {
      title: "Urban Street Art",
      description: "Large-scale outdoor mural celebrating community and culture",
      category: "exterior",
      order: 2,
      createdAt: now,
      updatedAt: now,
    });

    const canvasProject = await ctx.db.insert("projects", {
      title: "Abstract Expression",
      description: "Bold canvas work exploring form and color",
      category: "canvas",
      order: 3,
      createdAt: now,
      updatedAt: now,
    });

    // Add sample images to projects (using placeholder URLs)
    // Interior project images
    await ctx.db.insert("images", {
      projectId: interiorProject,
      url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800",
      isFeatured: true,
      order: 0,
    });
    await ctx.db.insert("images", {
      projectId: interiorProject,
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
      isFeatured: false,
      order: 1,
    });
    await ctx.db.insert("images", {
      projectId: interiorProject,
      url: "https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800",
      isFeatured: false,
      order: 2,
    });

    // Exterior project images
    await ctx.db.insert("images", {
      projectId: exteriorProject,
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      isFeatured: true,
      order: 0,
    });
    await ctx.db.insert("images", {
      projectId: exteriorProject,
      url: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800",
      isFeatured: false,
      order: 1,
    });
    await ctx.db.insert("images", {
      projectId: exteriorProject,
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
      isFeatured: false,
      order: 2,
    });

    // Canvas project images
    await ctx.db.insert("images", {
      projectId: canvasProject,
      url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
      isFeatured: true,
      order: 0,
    });
    await ctx.db.insert("images", {
      projectId: canvasProject,
      url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800",
      isFeatured: false,
      order: 1,
    });
    await ctx.db.insert("images", {
      projectId: canvasProject,
      url: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=800",
      isFeatured: false,
      order: 2,
    });

    return { 
      success: true, 
      message: "Seeded 3 projects with images",
      projectIds: [interiorProject, exteriorProject, canvasProject]
    };
  },
});
