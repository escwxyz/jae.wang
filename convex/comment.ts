import { asyncMap } from "convex-helpers";
import { zid } from "convex-helpers/server/zod4";
import { z } from "zod/v4";
import { createAuthMutation, zQuery } from "./functions";
import { commentField } from "./schema";

// list all comments for a post
export const listByPost = zQuery({
  args: {
    postId: zid("post"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comment")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    return asyncMap(comments, async (comment) => {
      const author = await ctx.db
        .query("user")
        .withIndex("by_id", (q) => q.eq("_id", comment.authorId))
        .unique();

      if (!author) {
        throw new Error("A comment without author");
      }
      return {
        ...comment,
        author: {
          name: author.name,
          avatarUrl: author.avatarUrl,
          website: author.website,
        },
      };
    });
  },
});

export const createComment = createAuthMutation({})({
  args: z.object({
    postId: commentField.postId,
    parentId: commentField.parentId,
    content: commentField.content,
  }),
  handler: async (ctx, args) => {
    const parent = args.parentId ? await ctx.db.get(args.parentId) : null;
    if (args.parentId && !parent) {
      throw new Error("Parent comment not found.");
    }

    if (parent && parent.postId !== args.postId) {
      throw new Error("Parent comment does not belong to this post.");
    }

    const depth = parent ? parent.depth + 1 : 0;

    return await ctx.db.insert("comment", {
      postId: args.postId,
      authorId: ctx.userId,
      parentId: args.parentId,
      depth,
      content: args.content,
      isAdmin: ctx.user.isAdmin,
    });
  },
});

export const deleteComment = createAuthMutation({ role: "admin" })({
  args: z.object({
    id: zid("comment"),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.delete("comment", args.id);
  },
});
