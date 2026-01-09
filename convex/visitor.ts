import { z } from "zod/v4";
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
