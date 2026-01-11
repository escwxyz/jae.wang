import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { vSessionId } from "convex-helpers/server/sessions";
import { zid, zodToConvexFields } from "convex-helpers/server/zod4";
import { z } from "zod/v4";
import { tables as authTables } from "./authSchema";

export const slugRegEx = /^(\w+)((-\w+)+)?$/;

export const siteConfigFields = {
  siteName: z.string(),
  // siteLogoKey: z.optional(z.string()),
  // siteLogoUrl: z.url(),
  siteTagline: z.optional(z.string().max(10)),
  siteDescription: z.string().min(120).max(160),
  contactEmail: z.email(),
  siteAuthor: z.string(),
  siteAuthorUrl: z.url(),
  siteOgImageUrl: z.url(),
};

export const projectFields = {
  title: z.string().max(30),
  slug: z.string().regex(slugRegEx),
  content: z.string().min(100),
  techstack: z.array(
    z
      .string()
      .refine((tag) => tag === tag.toLowerCase(), "Tags must be lowercase")
  ),
  images: z.array(z.url()),
  githubUrl: z.optional(z.url()),
  liveUrl: z.optional(z.url()),
  featured: z.boolean().default(false),
  order: z.number().int().min(0),
  published: z.boolean().default(true),
  year: z.optional(z.number().int().min(2022)),
  status: z.enum(["finished", "pending"]).default("finished"),
  lastSyncedAt: z.number(),
};

export const metadataFields = {
  currentPath: z.string(),
  ip: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  device: z.enum(["mobile", "desktop"]).optional(),
};

export const contactFormFields = {
  name: z
    .string()
    .min(2, { error: "Your name must be at least 2 chars" })
    .max(20, { error: "You name must be at most 20 chars" }),
  email: z.email({ error: "Email is invalid" }),
  message: z
    .string()
    .min(10, { error: "Your message must be at least 10 chars" }),
};

export const postFields = {
  title: z
    .string()
    .max(60, { error: "Post title shall not be longer than 60 chars" }),
  slug: z.string().regex(slugRegEx, {
    error: "Slug can only contain letters, numbers, hyphens or underscores",
  }),
  // authorId: zid("user"),
  language: z.enum(["en", "de", "zh-cn"]).default("en"),
  excerpt: z.string().max(100), // short description for post card
  description: z.string().max(200), // for summary and metadata
  content: z.string(),
  date: z.iso.datetime(), // ISO date string
  lastmod: z.iso.datetime(),
  isPublished: z.boolean().default(true),
  isUnlisted: z.boolean().default(false),
  tags: z.array(
    z
      .string()
      .refine((tag) => tag === tag.toLowerCase(), "Tags must be lowercase")
  ),
  coverImageKey: z.optional(z.string()), // this is the r2 object
  coverImageUrl: z.url(),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.optional(z.number().min(0)), // Order in featured section (lower = first)
  lastSyncedAt: z.number(),
};

export const commentField = {
  postId: zid("post"),
  authorId: zid("user"),
  parentId: z.optional(zid("comment")),
  depth: z.number().int().min(0),
  content: z
    .string()
    .max(500, { error: "Comment length shall be less than 500" }),
  isAdmin: z.boolean(),
};

export default defineSchema({
  ...authTables,
  post: defineTable({
    ...zodToConvexFields(postFields),
  })
    .index("by_slug", ["slug"])
    .index("by_publishedAt", ["date"])
    .index("by_language", ["language"])
    .index("by_published", ["isPublished"])
    .index("by_unlisted", ["isUnlisted"])
    .index("by_published_unlisted_publishedAt", [
      "isPublished",
      "isUnlisted",
      "date",
    ])
    .index("by_featured", ["isFeatured"])
    // .index("by_author", ["authorId"])
    .index("by_featured_order", ["isFeatured", "featuredOrder"])
    .searchIndex("search_content", {
      searchField: "content", // todo, not support cjk
      filterFields: ["isPublished"],
    })
    .searchIndex("search_title", {
      searchField: "title", // todo, not support cjk
      filterFields: ["isPublished"],
    }),

  comment: defineTable({
    ...zodToConvexFields(commentField),
    // ...zodToConvexFields(metadataFields),
  })
    .index("by_post", ["postId"])
    .index("by_post_parent", ["postId", "parentId"])
    .index("by_post_depth", ["postId", "depth"])
    .index("by_author", ["authorId"]),

  postViewCount: defineTable({
    slug: v.string(), // post slug
    count: v.number(),
  }).index("by_slug", ["slug"]),

  project: defineTable({
    ...zodToConvexFields(projectFields),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_featured_order", ["featured", "order"])
    .index("by_year", ["year"])
    .index("by_status", ["status"]),

  // Newsletter subscribers table
  // Stores email subscriptions with unsubscribe tokens
  newsletterSubscriber: defineTable({
    email: v.string(), // Subscriber email address (lowercase, trimmed)
    subscribed: v.boolean(), // Current subscription status
    subscribedAt: v.number(), // Timestamp when subscribed
    unsubscribedAt: v.optional(v.number()), // Timestamp when unsubscribed (if applicable)
    source: v.string(), // Where they signed up: "home", "blog-page", "post", or "post:slug-name"
    unsubscribeToken: v.string(), // Secure token for unsubscribe links
  })
    .index("by_email", ["email"])
    .index("by_subscribed", ["subscribed"]),

  // Track sessions for public visitors
  visitor: defineTable({
    ...zodToConvexFields(metadataFields),
    sessionId: vSessionId,
    lastSeen: v.number(),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_lastSeen", ["lastSeen"]),

  contact: defineTable({
    ...zodToConvexFields(contactFormFields),
    ...zodToConvexFields(metadataFields),
  }),

  siteConfig: defineTable({
    ...zodToConvexFields(siteConfigFields),
  }),
});
