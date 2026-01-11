import { z } from "zod/v4";
import { zMutation, zQuery } from "./functions";
import { projectFields } from "./schema";

export const list = zQuery({
  args: {},
  handler: async (ctx, _args) => {
    return await ctx.db.query("project").order("desc").collect();
  },
});

export const getFeaturedProjects = zQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("project")
      .withIndex("by_featured_order", (q) =>
        q.eq("featured", true).lte("order", 3)
      )
      .collect();
  },
});

export const syncProjects = zMutation({
  args: z.object({
    projects: z.array(
      z.object(projectFields).omit({
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

    const now = Date.now();

    const incomingSlugs = new Set(args.projects.map((p) => p.slug));

    const existingProjects = await ctx.db.query("project").collect();
    const existingBySlug = new Map(existingProjects.map((p) => [p.slug, p]));

    for (const { content, ...rest } of args.projects) {
      const existing = existingBySlug.get(rest.slug);

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...rest,
          content,
          lastSyncedAt: now,
        });

        updated++;
      } else {
        await ctx.db.insert("project", {
          ...rest,
          content,
          lastSyncedAt: now,
        });
        created++;
      }

      for (const existing of existingProjects) {
        if (!incomingSlugs.has(existing.slug)) {
          await ctx.db.delete(existing._id);
          deleted++;
        }
      }
    }
    return { created, updated, deleted };
  },
});
