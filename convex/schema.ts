import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("interior"),
      v.literal("exterior"),
      v.literal("canvas")
    ),
    featuredImageId: v.optional(v.id("images")),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"]),

  images: defineTable({
    projectId: v.id("projects"),
    storageId: v.optional(v.id("_storage")),
    isFeatured: v.boolean(),
    order: v.number(),
    url: v.string(),
  }).index("by_project", ["projectId"]),

  about: defineTable({
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    bioText: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    imageStorageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }),
});
