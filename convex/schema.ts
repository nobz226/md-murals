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

  sounds: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("click"),
      v.literal("open"),
      v.literal("close"),
      v.literal("zoom-in"),
      v.literal("zoom-out"),
      v.literal("drag-start"),
      v.literal("drag-end"),
      v.literal("nav-hover"),
      v.literal("nav-click")
    ),
    storageId: v.optional(v.id("_storage")),
    url: v.string(),
    updatedAt: v.number(),
  }).index("by_type", ["type"]),
});
