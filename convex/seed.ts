import { mutation } from "./_generated/server";
import { adminKeyArg, assertAdmin } from "./adminAuth";

export const clearData = mutation({
  args: adminKeyArg,
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const projects = await ctx.db.query("projects").collect();
    const images = await ctx.db.query("images").collect();
    const sounds = await ctx.db.query("sounds").collect();
    
    for (const image of images) {
      if (image.storageId) {
        await ctx.storage.delete(image.storageId);
      }
      await ctx.db.delete(image._id);
    }
    
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }
    
    for (const sound of sounds) {
      if (sound.storageId) {
        await ctx.storage.delete(sound.storageId);
      }
      await ctx.db.delete(sound._id);
    }
    
    return { 
      success: true, 
      message: `Cleared ${projects.length} projects, ${images.length} images, and ${sounds.length} sounds` 
    };
  },
});

// ---------------------------------------------------------------------------
// PLACEHOLDER CONTENT
// Temporary content until the client supplies photos of their own work.
// Every image is a free photo from Unsplash (Unsplash License: free to use,
// attribution not required). Photographer credits are kept next to each photo
// so they can be acknowledged in presentations. Titles and descriptions are
// invented to match the photo and should be replaced with real project details.
// ---------------------------------------------------------------------------

type Category = "interior" | "exterior" | "canvas";
// [Unsplash photo id, photographer]
type Photo = [string, string];
type SeedProject = { title: string; description: string; images: Photo[] };

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80`;

const interiorProjects: SeedProject[] = [
  {
    title: "Harvest Ceiling",
    description: "Hand-painted fruit and vegetable motifs across a restaurant's coffered ceiling",
    images: [["1784916988712-8757dc508990", "Julia Taubitz"], ["1784916990054-ede4fbd39dec", "Julia Taubitz"]],
  },
  {
    title: "Tiger in the Dining Room",
    description: "A full-wall tiger mural that gives a restaurant its signature look",
    images: [["1777983304850-2d39802bdf82", "Beth Stevenson"]],
  },
  {
    title: "Colour Room",
    description: "Bold colour fields painted to wrap a restaurant's seating area",
    images: [["1777807656723-5361321c27ec", "MACAU PHOTOGRAPHY"]],
  },
  {
    title: "Between the Stairs",
    description: "A large-format mural painted into a stairwell, read from both flights",
    images: [["1767294275895-1a1c39ef53c9", "Shahabudin Ibragimov"], ["1624198376649-c121a452d157", "Leo Kwan"]],
  },
  {
    title: "Doorway Light",
    description: "Colour painted to catch the daylight coming through an entrance",
    images: [["1773270196886-58a9def31840", "Spencer Plouzek"]],
  },
  {
    title: "Painted Ceiling Suite",
    description: "A decorative ceiling that turns a bedroom into a quiet retreat",
    images: [["1709544506583-cfb9845cdfb9", "Baubauwall Wallpapers"]],
  },
  {
    title: "Kitchen Feature Wall",
    description: "A statement painting anchoring an open-plan kitchen",
    images: [["1652734853828-24f9c9dceb94", "Virginia Birstler"]],
  },
  {
    title: "Playroom Characters",
    description: "Playful hand-drawn figures for a children's playroom",
    images: [["1780404361412-961f0c287749", "Haberdoedas"]],
  },
  {
    title: "Work in Progress",
    description: "Behind the scenes: from primed wall to finished colour",
    images: [["1529722155810-17303d209942", "Joseph Pérez"], ["1501084817091-a4f3d1d19e07", "Matthieu Comoy"]],
  },
];

const exteriorProjects: SeedProject[] = [
  {
    title: "Bloom Street",
    description: "Oversized smiling flowers brightening a downtown facade",
    images: [["1784146929750-dead7b3ebc14", "Alexander Kaufmann"], ["1632258476674-3a8a1c251294", "Delfina Iacub"]],
  },
  {
    title: "Garden Walk",
    description: "A floral mural along a busy bike and pedestrian route",
    images: [["1767930906380-13819072bc71", "kt Leung"], ["1769265114376-50b2a7528258", "ayumi kubo"]],
  },
  {
    title: "The Long Wall",
    description: "An intricate, block-long mural painted in sections over a summer",
    images: [["1785675694436-84ed32ed55e7", "T"], ["1780856036092-1ef0934f3f55", "T"]],
  },
  {
    title: "Currents",
    description: "Swirling organic shapes that move across a building's surface",
    images: [["1765133915262-df0cd0e27764", "The Quiet Atlas"], ["1777925118898-d895eed4c8d1", "Vitalii Onyshchuk"]],
  },
  {
    title: "Above the Street",
    description: "Multi-storey mural designed to be seen from street level",
    images: [["1762430187249-fe08df17185c", "Uran Wang"], ["1721808524566-a047e20664bb", "Patrick Federi"], ["1778843865140-03c122f0081d", "Daria K"]],
  },
  {
    title: "Two Faces",
    description: "Portrait mural celebrating the people of the neighbourhood",
    images: [["1547890316-3bb90edb9004", "Domenico Loia"], ["1547891654-e66ed7ebb968", "Dan Farrell"]],
  },
  {
    title: "Neighbourhood Landmark",
    description: "A side-of-building mural that has become a local meeting point",
    images: [["1632267071031-1cda764f851f", "Tim Mossholder"], ["1548442473-d28c0b419129", "Hannes Richter"], ["1540929819775-fcc7d4649250", "Mike Von"]],
  },
  {
    title: "Under the Bridge",
    description: "Turning overlooked infrastructure into a colourful passage",
    images: [["1791199049374-0105c114e255", "Suad Kamardeen"], ["1487452066049-a710f7296400", "Hin Bong Yeung"]],
  },
  {
    title: "Patio Mural",
    description: "An outdoor dining wall painted to extend the restaurant's brand",
    images: [["1786204031144-605d1d07942f", "Ben Tripp"], ["1786204030798-c45c1246f014", "Ben Tripp"]],
  },
  {
    title: "Laneway Characters",
    description: "A cast of friendly cartoon characters for a back-lane art walk",
    images: [["1642369073424-a98bf968b5d3", "JAM"], ["1642370324100-324b21fab3a9", "JAM"], ["1642370323814-4de432e3b796", "JAM"]],
  },
  {
    title: "Monster Block Party",
    description: "Wide-eyed creatures painted with a community youth program",
    images: [["1581850518616-bcb8077a2336", "Alp Ancel"], ["1788416636448-d38f9a1647e5", "Kouji Tsuru"]],
  },
  {
    title: "Teahouse Wall",
    description: "Illustrative mural telling the story of a family-run teahouse",
    images: [["1777178800797-078d09d2bc5b", "Danish Prakash"], ["1772982903309-6b47495a3219", "Alex Batonisashvili"]],
  },
  {
    title: "Pacific Pink",
    description: "Ocean life in an unexpected palette on a seaside wall",
    images: [["1568578728608-3606b14e85fe", "Crawford Jolly"], ["1574521355290-c7bfcafd5c9d", "Adam Bouse"]],
  },
  {
    title: "Storefront Revival",
    description: "Painted shopfronts helping small businesses stand out on the block",
    images: [["1760265081336-87017a6fc925", "alexandre alex"], ["1776648383277-ea5976b3bde7", "Peter Barrett Bryan"]],
  },
  {
    title: "Courtyard Blossoms",
    description: "Black, white and pink florals softening a brick courtyard",
    images: [["1791145698350-892f1aa6a053", "Andrii Solok"], ["1624982217239-59d768f45922", "Heather Villagran"]],
  },
];

const canvasProjects: SeedProject[] = [
  {
    title: "Orange Bloom",
    description: "Acrylic on canvas: vivid florals painted from life",
    images: [["1778897426627-0c29354ff50c", "Cilantro Biscuits"]],
  },
  {
    title: "Lotus by the Window",
    description: "A quiet study of a lotus in soft natural light",
    images: [["1768852662817-48d96e68e02e", "Jim Luo"]],
  },
  {
    title: "Cliffside Tree",
    description: "A West Coast landscape in progress on the easel",
    images: [["1541753866388-0b3c701627d3", "Jade Stephens"]],
  },
  {
    title: "Field Notes",
    description: "Layered abstract work built up over many sessions",
    images: [["1541961017774-22349e4a1262", "Steve A Johnson"], ["1533208087231-c3618eab623c", "Steve A Johnson"]],
  },
  {
    title: "Blue Hour",
    description: "Blue and orange in conversation, large-format acrylic",
    images: [["1536849460588-696219a9e98d", "Steve A Johnson"]],
  },
  {
    title: "Primary Weather",
    description: "Loose, gestural studies in primary colour",
    images: [["1532640331846-d2da5987c3ee", "Steve A Johnson"], ["1531489956451-20957fab52f2", "Steve A Johnson"]],
  },
  {
    title: "Graphite",
    description: "Monochrome brushwork on a heavily textured ground",
    images: [["1541512416146-3cf58d6b27cc", "Steve A Johnson"], ["1622542796254-5b9c46ab0d2f", "Luca Nicoletti"]],
  },
  {
    title: "Monsoon",
    description: "Saturated blues, yellows and reds poured and scraped",
    images: [["1615184697985-c9bde1b07da7", "Mayur Deshpande"]],
  },
  {
    title: "Signal Fire",
    description: "A pair of warm abstracts made as companion pieces",
    images: [["1605721911519-3dfeb3be25e7", "Jené Stephaniuk"], ["1602464729960-f95937746b68", "Jené Stephaniuk"]],
  },
  {
    title: "Coastline",
    description: "Blue, white and yellow inspired by the shoreline",
    images: [["1618331833071-ce81bd50d300", "Vojtech Bruzek"]],
  },
  {
    title: "Wild Gesture",
    description: "Fast, bold strokes in a full-spectrum palette",
    images: [["1770129703548-e1ced0e4f118", "Fons Heijnsbroek"]],
  },
  {
    title: "Ember",
    description: "Heat and contrast in orange, red and black",
    images: [["1552250575-e508473b090f", "Josep Martins"], ["1526389157-6a5cc2bb4afa", "Dan Cook"]],
  },
  {
    title: "Northern Lines",
    description: "Earthy abstracts drawn from northern landscapes",
    images: [["1515405295579-ba7b45403062", "Henrik Dønnestad"], ["1620562303747-ba21ca6f1530", "ActionVance"]],
  },
  {
    title: "Studio Series",
    description: "Works on the easel and around the studio",
    images: [["1785423613154-a3f078420790", "Clay Banks"], ["1740710543611-80b658171bc3", "Ashe Walker"], ["1783346423247-3d11a8e7bd64", "arpan dutta"]],
  },
  {
    title: "Surface Study",
    description: "Close-up exploration of paint, texture and colour mixing",
    images: [["1649479435119-1d987ed1ae36", "Wesley Tingey"], ["1758522274454-07a58f332320", "Vitaly Gariev"]],
  },
];

const placeholderAbout = {
  title: "Mihai Darvasa",
  bioTitle: "Walls, canvas and colour",
  bio:
    "I'm a Vancouver-based mural and canvas artist who turns blank walls into places people want to be. " +
    "My work ranges from restaurant ceilings and stairwells to multi-storey exteriors and smaller studio paintings.\n\n" +
    "Every project starts with a conversation about the space, the people who use it, and the story it should tell. " +
    "From there I sketch, refine the design with the client, and paint everything by hand.\n\n" +
    "When I'm not painting, you'll find me looking after my plants, exploring the coast and mountains, or spending time with my kids.",
  // Hands applying paint to a mural (Leo_Visions, Unsplash)
  imageUrl: unsplash("1786992294675-57fe5ffad108"),
};

export const seedData = mutation({
  args: adminKeyArg,
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    // Check if we already have projects
    const existing = await ctx.db.query("projects").first();
    if (existing) {
      return { success: false, message: "Database already has projects" };
    }

    const now = Date.now();
    let order = 1;
    let imageCount = 0;

    const groups: [Category, SeedProject[]][] = [
      ["interior", interiorProjects],
      ["exterior", exteriorProjects],
      ["canvas", canvasProjects],
    ];

    for (const [category, projects] of groups) {
      for (const project of projects) {
        const projectId = await ctx.db.insert("projects", {
          title: project.title,
          description: project.description,
          category,
          order: order++,
          createdAt: now,
          updatedAt: now,
        });

        for (let i = 0; i < project.images.length; i++) {
          const imageId = await ctx.db.insert("images", {
            projectId,
            url: unsplash(project.images[i][0]),
            isFeatured: i === 0,
            order: i,
          });
          if (i === 0) await ctx.db.patch(projectId, { featuredImageId: imageId });
          imageCount++;
        }
      }
    }

    // Only fill in the About panel if it hasn't been set up yet
    const about = await ctx.db.query("about").first();
    if (!about) {
      await ctx.db.insert("about", { ...placeholderAbout, updatedAt: now });
    }

    return {
      success: true,
      message: `Seeded ${order - 1} placeholder projects with ${imageCount} images${about ? "" : " and the About panel"}`,
      totalProjects: order - 1,
    };
  },
});

// Seed example sounds (free sound effects from freesound.org and similar sources)
export const seedSounds = mutation({
  args: adminKeyArg,
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    // Check if we already have sounds
    const existing = await ctx.db.query("sounds").first();
    if (existing) {
      return { success: false, message: "Database already has sounds" };
    }

    const now = Date.now();
    
    // Verified working sound URLs from Mixkit (free, no attribution required)
    // All URLs tested and confirmed accessible as of Feb 2026
    const soundUrls = {
      click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",        // Select click (interface)
      open: "https://assets.mixkit.co/active_storage/sfx/1489/1489-preview.mp3",         // Cinematic whoosh (open detail)
      close: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3",        // Click error (close/back)
      "zoom-in": "https://assets.mixkit.co/active_storage/sfx/1714/1714-preview.mp3",    // Fast rocket whoosh (zoom in)
      "zoom-out": "https://assets.mixkit.co/active_storage/sfx/1491/1491-preview.mp3",   // Cinematic whoosh stutter (zoom out)
      "drag-start": "https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3", // Software interface start
      "drag-end": "https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3",   // Software interface back
      "nav-hover": "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3",  // Interface option select (subtle hover)
      "nav-click": "https://assets.mixkit.co/active_storage/sfx/1109/1109-preview.mp3"   // Software interface start (nav click)
    };

    const soundTypes = [
      { type: "click" as const, name: "Click Sound" },
      { type: "open" as const, name: "Open Sound" },
      { type: "close" as const, name: "Close Sound" },
      { type: "zoom-in" as const, name: "Zoom In Sound" },
      { type: "zoom-out" as const, name: "Zoom Out Sound" },
      { type: "drag-start" as const, name: "Drag Start Sound" },
      { type: "drag-end" as const, name: "Drag End Sound" },
      { type: "nav-hover" as const, name: "Nav Hover Sound" },
      { type: "nav-click" as const, name: "Nav Click Sound" }
    ];

    for (const sound of soundTypes) {
      await ctx.db.insert("sounds", {
        name: sound.name,
        type: sound.type,
        url: soundUrls[sound.type],
        updatedAt: now,
      } as any); // Using 'as any' because we're creating sounds without storageId for seed data
    }

    return { 
      success: true, 
      message: `Seeded ${soundTypes.length} example sounds (including nav-hover and nav-click)`,
      totalSounds: soundTypes.length
    };
  },
});
