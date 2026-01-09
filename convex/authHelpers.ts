import { getSession } from "better-auth-convex";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export type SessionUser = Pick<
  Doc<"user">,
  "_id" | "name" | "avatarUrl" | "website" | "createdAt"
> & {
  isAdmin: boolean;
  session: Doc<"session">;
};

export const getSessionData = async (
  ctx: MutationCtx | QueryCtx
): Promise<SessionUser | null> => {
  const session = await getSession(ctx);

  if (!session) {
    return null;
  }

  const user = await ctx.db.get("user", session.userId as Id<"user">);

  if (!user) {
    return null;
  }

  return {
    ...user,
    isAdmin: user.role === "admin",
    session,
  };
};
