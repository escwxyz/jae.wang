import { SessionIdArg } from "convex-helpers/server/sessions";
import { z } from "zod/v4";
import { internalQuery } from "./_generated/server";
import { zMutationWithSession } from "./functions";
import { metadataFields } from "./schema";

export const updateVisitor = zMutationWithSession({
  args: z.object(metadataFields),
  handler: async (ctx, args) => {
    const { visitor, sessionId } = ctx;

    const now = Date.now();

    if (visitor) {
      await ctx.db.patch("visitor", visitor._id, {
        ...args,
        lastSeen: now,
      });

      return visitor._id;
    }

    return await ctx.db.insert("visitor", {
      sessionId,
      ...args,
      lastSeen: now,
    });
  },
});

export const getVisitor = internalQuery({
  args: SessionIdArg,
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visitor")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
  },
});
