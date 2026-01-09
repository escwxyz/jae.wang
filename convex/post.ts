import { paginationOptsValidator } from "convex/server";
import { filter } from "convex-helpers/server/filter";
import { convexToZod } from "convex-helpers/server/zod4";
import { z } from "zod/v4";
import { createAuthPaginatedQuery, zMutation, zQuery } from "./functions";
import { postFields } from "./schema";

export const getAllPosts = createAuthPaginatedQuery({ role: "admin" })({
  args: z.object({
    paginationOpts: convexToZod(paginationOptsValidator),
  }),

  handler: async (ctx, args) => {
    return await ctx.db
      .query("post")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getAllPostTags = zQuery({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("post")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    const listedPosts = posts.filter((post) => !post.isUnlisted);

    // Count occurrences of each tag
    const tagCounts = new Map<string, number>();
    for (const post of listedPosts) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.tag.localeCompare(b.tag);
      });
  },
});

// Not include unlished posts
export const getPublishedPosts = zQuery({
  args: z.object({
    paginationOpts: convexToZod(paginationOptsValidator),
    tag: z.string().optional(),
  }),
  handler: async (ctx, { paginationOpts, tag }) => {
    const base = ctx.db
      .query("post")
      .withIndex("by_published_unlisted_publishedAt", (q) =>
        q.eq("isPublished", true).eq("isUnlisted", false)
      )
      .order("desc");

    return await filter(base, (post) => {
      if (tag) {
        return post.tags.some((t) => t === tag.toLowerCase()); // t is already lowercase
      }
      return true;
    }).paginate(paginationOpts);
  },
});

export const getPostBySlug = zQuery({
  args: z.object({
    slug: z.string(),
  }),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("post")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post?.isPublished) {
      return null;
    }

    return post;
  },
});

export const getRelatedPosts = zQuery({
  args: z.object({
    currentSlug: z.string(),
    tags: z.array(z.string()),
    limit: z.optional(z.number()).default(3),
  }),
  handler: async (ctx, args) => {
    const maxResults = args.limit;

    if (args.tags.length === 0) {
      return [];
    }

    const posts = await ctx.db
      .query("post")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    return posts
      .filter((post) => post.slug !== args.currentSlug && !post.isUnlisted)
      .map((post) => {
        const sharedTags = post.tags.filter((tag) =>
          args.tags.some((t) => t.toLowerCase() === tag)
        ).length;

        return {
          _id: post._id,
          coverImageUrl: post.coverImageUrl,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          date: post.date,
          tags: post.tags,
          sharedTags,
        };
      })
      .filter((post) => post.sharedTags > 0)
      .sort((a, b) => {
        // Sort by shared tags count first, then by date
        if (b.sharedTags !== a.sharedTags) {
          return b.sharedTags - a.sharedTags;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, maxResults);
  },
});

export const getPostViewCount = zQuery({
  args: z.object({
    slug: z.string(),
  }),
  handler: async (ctx, args) => {
    const viewCount = await ctx.db
      .query("postViewCount")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return viewCount?.count ?? 0;
  },
});

export const increasePostViewCount = zMutation({
  args: z.object({
    slug: z.string(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("postViewCount")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
      });
    } else {
      await ctx.db.insert("postViewCount", {
        slug: args.slug,
        count: 1,
      });
    }
  },
});

// This is to sync local markdown files to convex, note that we need to convert markdown to blocks
// todo: we will move it to workpool queue
export const syncPosts = zMutation({
  args: z.object({
    posts: z.array(
      z.object(postFields).omit({
        lastSyncedAt: true,
      })
    ),
  }),
  returns: z.object({
    created: z.number(),
    updated: z.number(),
    deleted: z.number(),
  }),
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;
    let deleted = 0;

    const now = new Date().toISOString();
    const incomingSlugs = new Set(args.posts.map((p) => p.slug));

    const existingPosts = await ctx.db.query("post").collect();
    const existingBySlug = new Map(existingPosts.map((p) => [p.slug, p]));

    for (const { content, ...rest } of args.posts) {
      const existing = existingBySlug.get(rest.slug);

      if (existing) {
        // update existing post
        await ctx.db.patch(existing._id, {
          ...rest,
          content,
          lastSyncedAt: now,
        });

        updated++;
      } else {
        await ctx.db.insert("post", {
          ...rest,
          content,
          lastSyncedAt: now,
        });
        created++;
      }
    }

    for (const existing of existingPosts) {
      if (!incomingSlugs.has(existing.slug)) {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted };
  },
});
