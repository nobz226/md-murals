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

    const now = Date.now();
    const projectIds = [];
    let orderCounter = 1;

    // Interior murals - 13 projects
    const interiorProjects = [
      { title: "Modern Living Room Mural", description: "Contemporary geometric design bringing life to interior spaces", images: ["photo-1561214115-f2f134cc4912", "photo-1513694203232-719a280e022f", "photo-1562095241-8c6714fd4178", "photo-1579546929518-9e396f3cc809"] },
      { title: "Botanical Bedroom", description: "Lush tropical plants creating a serene sleeping environment", images: ["photo-1558618666-fcd25c85cd64", "photo-1569163139394-de4798aa62b6", "photo-1579783902614-a3fb3927b6a5", "photo-1582407947304-fd86f028f716"] },
      { title: "Abstract Office Space", description: "Bold shapes and colors inspiring creativity in workspace", images: ["photo-1541961017774-22349e4a1262", "photo-1547826039-bfc35e0f1ea8", "photo-1578301978162-7aae4d755744", "photo-1549887534-1541e9326642"] },
      { title: "Minimalist Hallway", description: "Clean lines and subtle tones enhancing architectural features", images: ["photo-1582719478250-c89cae4dc85b", "photo-1578632767115-351597cf2477", "photo-1616486338812-3dadae4b4ace", "photo-1600210492486-724fe5c67fb0"] },
      { title: "Kids Room Adventure", description: "Playful characters and landscapes for imaginative play", images: ["photo-1558618666-fcd25c85cd64", "photo-1584464491033-06628f3a6b7b", "photo-1502086223501-7ea6ecd79368", "photo-1551135049-8a33b5883817"] },
      { title: "Restaurant Feature Wall", description: "Culinary-inspired artwork elevating dining experience", images: ["photo-1578301978018-3005759f48f7", "photo-1551218808-94e220e084d2", "photo-1533090161767-e6ffed986c88", "photo-1517248135467-4c7edcad34c4"] },
      { title: "Wellness Center Mural", description: "Calming nature scenes promoting peace and healing", images: ["photo-1506905925346-21bda4d32df4", "photo-1511497584788-876760111969", "photo-1470071459604-3b5ec3a7fe05", "photo-1426604966848-d7adac402bff"] },
      { title: "Library Reading Nook", description: "Literary-themed artwork celebrating the joy of reading", images: ["photo-1481627834876-b7833e8f5570", "photo-1524995997946-a1c2e315a42f", "photo-1507842217343-583bb7270b66", "photo-1495446815901-a7297e633e8d"] },
      { title: "Gym Motivation Wall", description: "Dynamic energy and movement inspiring fitness goals", images: ["photo-1534438327276-14e5300c3a48", "photo-1571019614242-c5c5dee9f50b", "photo-1517836357463-d25dfeac3438", "photo-1544367567-0f2fcb009e0b"] },
      { title: "Cafe Coffee Culture", description: "Warm coffee-inspired tones creating cozy atmosphere", images: ["photo-1495474472287-4d71bcdd2085", "photo-1509042239860-f550ce710b93", "photo-1501339847302-ac426a4a7cbb", "photo-1442512595331-e89e73853f31"] },
      { title: "Hotel Lobby Elegance", description: "Sophisticated abstract design welcoming guests", images: ["photo-1566073771259-6a8506099945", "photo-1582719508461-905c673771fd", "photo-1551882547-ff40c63fe5fa", "photo-1571896349842-33c89424de2d"] },
      { title: "Spa Zen Garden", description: "Tranquil Asian-inspired scenes for ultimate relaxation", images: ["photo-1540555700478-4be289fbecef", "photo-1544161515-4ab6ce6db874", "photo-1507003211169-0a1dd7228f2d", "photo-1602524206684-76a3bc5c3eb2"] },
      { title: "Studio Apartment Accent", description: "Space-maximizing design adding depth to small spaces", images: ["photo-1522708323590-d24dbb6b0267", "photo-1484101403633-562f891dc89a", "photo-1493809842364-78817add7ffb", "photo-1556909114-f6e7ad7d3136"] }
    ];

    for (const project of interiorProjects) {
      const projectId = await ctx.db.insert("projects", {
        title: project.title,
        description: project.description,
        category: "interior",
        order: orderCounter++,
        createdAt: now,
        updatedAt: now,
      });
      projectIds.push(projectId);

      for (let i = 0; i < project.images.length; i++) {
        await ctx.db.insert("images", {
          projectId: projectId,
          url: `https://images.unsplash.com/${project.images[i]}?w=800`,
          isFeatured: i === 0,
          order: i,
        });
      }
    }

    // Exterior murals - 13 projects
    const exteriorProjects = [
      { title: "Urban Street Art", description: "Large-scale outdoor mural celebrating community and culture", images: ["photo-1499781350541-7783f6c6a0c8", "photo-1558618666-fcd25c85cd64", "photo-1515191107209-c28698631303", "photo-1549887534-1541e9326642"] },
      { title: "City Hall Portrait", description: "Iconic local heroes honored in public space", images: ["photo-1460661419201-fd4cecdf8a8b", "photo-1579783900882-c0d3dad7b119", "photo-1582407947304-fd86f028f716", "photo-1517639493569-5666a7556f8c"] },
      { title: "Neighborhood Garden Wall", description: "Vibrant flowers and wildlife beautifying urban landscape", images: ["photo-1470509037663-253afd7f0f51", "photo-1490750967868-88aa4486c946", "photo-1464226184884-fa280b87c399", "photo-1426604966848-d7adac402bff"] },
      { title: "Bridge Underpass Art", description: "Transforming infrastructure into cultural landmark", images: ["photo-1568605117036-5fe5e7bab0b7", "photo-1526214077412-d3b73c621bd7", "photo-1513694203232-719a280e022f", "photo-1501594907352-04cda38ebc29"] },
      { title: "School Playground Mural", description: "Educational and playful designs inspiring young minds", images: ["photo-1503676260728-1c00da094a0b", "photo-1564981797816-1043664bf78d", "photo-1551135049-8a33b5883817", "photo-1533090161767-e6ffed986c88"] },
      { title: "Historic Building Facade", description: "Heritage-inspired artwork respecting architectural history", images: ["photo-1478860409698-8707f313ee8b", "photo-1464207687429-7505649dae38", "photo-1548247661-3d7905940716", "photo-1486406146926-c627a92ad1ab"] },
      { title: "Park Boundary Wall", description: "Nature scenes extending green space into urban environment", images: ["photo-1441974231531-c6227db76b6e", "photo-1506905925346-21bda4d32df4", "photo-1511497584788-876760111969", "photo-1470071459604-3b5ec3a7fe05"] },
      { title: "Parking Structure Art", description: "Bold graphics transforming utilitarian space", images: ["photo-1513828583688-c52646db42da", "photo-1523217582562-09d0def993a6", "photo-1534670007418-fbb7f6cf32c3", "photo-1495954380655-9dc6c5b0f3a6"] },
      { title: "Waterfront Promenade", description: "Maritime-themed murals celebrating coastal heritage", images: ["photo-1505142468610-359e7d316be0", "photo-1551244072-5d12893278ab", "photo-1520443240718-fce21cc0b5f8", "photo-1507525428034-b723cf961d3e"] },
      { title: "Downtown Alley Gallery", description: "Series of connected murals creating outdoor art walk", images: ["photo-1515191107209-c28698631303", "photo-1499781350541-7783f6c6a0c8", "photo-1541961017774-22349e4a1262", "photo-1547826039-bfc35e0f1ea8"] },
      { title: "Community Center Exterior", description: "Inclusive imagery representing neighborhood diversity", images: ["photo-1522202176988-66273c2fd55f", "photo-1511632765486-a01980e01a18", "photo-1521737604893-d14cc237f11d", "photo-1524661135-423995f22d0b"] },
      { title: "Industrial District Revitalization", description: "Modern abstract design breathing new life into area", images: ["photo-1513694203232-719a280e022f", "photo-1562095241-8c6714fd4178", "photo-1579546929518-9e396f3cc809", "photo-1516802273409-68526ee1bdd6"] },
      { title: "Transit Station Platform", description: "Kinetic energy and movement through commuter space", images: ["photo-1534438327276-14e5300c3a48", "photo-1517836357463-d25dfeac3438", "photo-1544367567-0f2fcb009e0b", "photo-1485846234645-a62644f84728"] }
    ];

    for (const project of exteriorProjects) {
      const projectId = await ctx.db.insert("projects", {
        title: project.title,
        description: project.description,
        category: "exterior",
        order: orderCounter++,
        createdAt: now,
        updatedAt: now,
      });
      projectIds.push(projectId);

      for (let i = 0; i < project.images.length; i++) {
        await ctx.db.insert("images", {
          projectId: projectId,
          url: `https://images.unsplash.com/${project.images[i]}?w=800`,
          isFeatured: i === 0,
          order: i,
        });
      }
    }

    // Canvas works - 13 projects
    const canvasProjects = [
      { title: "Abstract Expression", description: "Bold canvas work exploring form and color", images: ["photo-1578301978162-7aae4d755744", "photo-1547826039-bfc35e0f1ea8", "photo-1541961017774-22349e4a1262", "photo-1549887534-1541e9326642"] },
      { title: "Midnight Dreams", description: "Dark moody palette capturing nocturnal imagination", images: ["photo-1520839090488-4a6c211e2f94", "photo-1577083552792-a0d461cb1dd6", "photo-1534531173927-aeb928d54385", "photo-1549887534-1541e9326642"] },
      { title: "Desert Landscapes", description: "Warm earth tones depicting arid beauty", images: ["photo-1509316785289-025f5b846b35", "photo-1501594907352-04cda38ebc29", "photo-1473496169904-658ba7c44d8a", "photo-1519904981063-b0cf448d479e"] },
      { title: "Ocean Depths", description: "Fluid blues exploring underwater worlds", images: ["photo-1505142468610-359e7d316be0", "photo-1551244072-5d12893278ab", "photo-1520443240718-fce21cc0b5f8", "photo-1507525428034-b723cf961d3e"] },
      { title: "Geometric Harmony", description: "Precise shapes creating mathematical beauty", images: ["photo-1513694203232-719a280e022f", "photo-1562095241-8c6714fd4178", "photo-1579546929518-9e396f3cc809", "photo-1516802273409-68526ee1bdd6"] },
      { title: "Floral Abundance", description: "Vibrant blooms celebrating natural beauty", images: ["photo-1470509037663-253afd7f0f51", "photo-1490750967868-88aa4486c946", "photo-1464226184884-fa280b87c399", "photo-1426604966848-d7adac402bff"] },
      { title: "Urban Fragments", description: "Collage of city life and architecture", images: ["photo-1477959858617-67f85cf4f1df", "photo-1449824913935-59a10b8d2000", "photo-1480714378408-67cf0d13bc1b", "photo-1444723121867-7a241cacace9"] },
      { title: "Emotional Portraits", description: "Expressive faces capturing human experience", images: ["photo-1522202176988-66273c2fd55f", "photo-1511632765486-a01980e01a18", "photo-1521737604893-d14cc237f11d", "photo-1524661135-423995f22d0b"] },
      { title: "Texture Studies", description: "Mixed media exploring surface and dimension", images: ["photo-1535451662379-b5385d44c7d2", "photo-1549887534-1541e9326642", "photo-1582407947304-fd86f028f716", "photo-1516802273409-68526ee1bdd6"] },
      { title: "Monochrome Minimalism", description: "Black and white exploration of form and light", images: ["photo-1507003211169-0a1dd7228f2d", "photo-1545989992-966ab7239654", "photo-1486312338219-ce68d2c6f44d", "photo-1487017159836-4e23ece2e4cf"] },
      { title: "Vibrant Energy", description: "Explosive color celebrating life and movement", images: ["photo-1541961017774-22349e4a1262", "photo-1533158326339-7f3cf2404354", "photo-1502691876148-a84978e59af8", "photo-1518709268805-4e9042af9f23"] },
      { title: "Natural Textures", description: "Organic patterns inspired by earth and stone", images: ["photo-1506905925346-21bda4d32df4", "photo-1511497584788-876760111969", "photo-1470071459604-3b5ec3a7fe05", "photo-1426604966848-d7adac402bff"] },
      { title: "Light and Shadow", description: "Chiaroscuro techniques creating dramatic contrast", images: ["photo-1481627834876-b7833e8f5570", "photo-1524995997946-a1c2e315a42f", "photo-1507842217343-583bb7270b66", "photo-1495446815901-a7297e633e8d"] }
    ];

    for (const project of canvasProjects) {
      const projectId = await ctx.db.insert("projects", {
        title: project.title,
        description: project.description,
        category: "canvas",
        order: orderCounter++,
        createdAt: now,
        updatedAt: now,
      });
      projectIds.push(projectId);

      for (let i = 0; i < project.images.length; i++) {
        await ctx.db.insert("images", {
          projectId: projectId,
          url: `https://images.unsplash.com/${project.images[i]}?w=800`,
          isFeatured: i === 0,
          order: i,
        });
      }
    }

    return { 
      success: true, 
      message: `Seeded 39 projects (13 per category) with unique images`,
      totalProjects: projectIds.length
    };
  },
});
