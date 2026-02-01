import { mutation } from "./_generated/server";

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
    await ctx.db.insert("images", {
      projectId: interiorProject,
      url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800",
      isFeatured: true,
      order: 1,
    });

    await ctx.db.insert("images", {
      projectId: exteriorProject,
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      isFeatured: true,
      order: 1,
    });

    await ctx.db.insert("images", {
      projectId: canvasProject,
      url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
      isFeatured: true,
      order: 1,
    });

    return { 
      success: true, 
      message: "Seeded 3 projects with images",
      projectIds: [interiorProject, exteriorProject, canvasProject]
    };
  },
});
