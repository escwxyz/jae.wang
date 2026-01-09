import { getHeaders } from "better-auth-convex";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, type Value } from "convex/values";
import {
  customCtx,
  customQuery,
  NoOp,
} from "convex-helpers/server/customFunctions";
import {
  runSessionFunctions,
  type SessionId,
  SessionIdArg,
} from "convex-helpers/server/sessions";
import {
  zCustomAction,
  zCustomMutation,
  zCustomQuery,
} from "convex-helpers/server/zod4";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { getAuth } from "./auth";
import { getSessionData, type SessionUser } from "./authHelpers";
import { roleGuard } from "./helpers/roleGuard";

export async function getVisitor(
  ctx: QueryCtx | MutationCtx,
  sessionId: SessionId
) {
  return await ctx.db
    .query("visitor")
    .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
    .unique();
}

export const queryWithSession = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const visitor = await getVisitor(ctx, sessionId);
    return { ctx: { ...ctx, visitor, sessionId }, args: {} };
  },
});

export const zQueryWithSession = zCustomQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const visitor = await getVisitor(ctx, sessionId);
    return { ctx: { ...ctx, visitor, sessionId }, args: {} };
  },
});

export const zQuery = zCustomQuery(query, NoOp);

export const zMutationWithSession = zCustomMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const visitor = await getVisitor(ctx, sessionId);
    return { ctx: { ...ctx, visitor, sessionId }, args: {} };
  },
});

export const zMutation = zCustomMutation(mutation, NoOp);

export const zActionWithSession = zCustomAction(action, {
  args: SessionIdArg,
  input: (ctx, { sessionId }) => {
    return {
      ctx: {
        ...ctx,
        ...runSessionFunctions(ctx, sessionId),
        sessionId,
      },
      args: {},
    };
  },
});

export const zAction = zCustomAction(action, NoOp);

export const zInternalQuery = zCustomQuery(internalQuery, NoOp);

export const zInternalMutation = zCustomMutation(internalMutation, NoOp);

export const zInternalAction = zCustomAction(internalAction, NoOp);

const AUTH_REQUIRED_ERROR: Value = {
  code: "UNAUTHENTICATED",
  message: "Not authenticated",
} as const;

const MUTATION_AUTH_REQUIRED_ERROR: Value = {
  code: "USER_NOT_FOUND",
  message: "Not authenticated",
} as const;

function requireUser<T>(user: T | null, error: Value = AUTH_REQUIRED_ERROR): T {
  if (!user) {
    throw new ConvexError(error);
  }

  return user;
}

async function withRequiredUserContext<Ctx extends MutationCtx | QueryCtx>(
  ctx: Ctx,
  user: SessionUser
) {
  return {
    ...ctx,
    auth: {
      ...ctx.auth,
      ...getAuth(ctx),
      headers: await getHeaders(ctx, user.session),
    },
    user,
    userId: user._id,
  };
}

export const createAuthPaginatedQuery = ({ role }: { role?: "admin" }) =>
  zCustomQuery(query, {
    args: {
      paginationOpts: paginationOptsValidator,
    },
    input: async (ctx, args) => {
      const user = requireUser(await getSessionData(ctx));
      if (role) {
        roleGuard(role, user);
      }

      return {
        args,
        ctx: await withRequiredUserContext(ctx, user),
      };
    },
  });

export const createAuthQuery = ({ role }: { role?: "admin" }) =>
  zCustomQuery(
    query,
    customCtx(async (ctx) => {
      const user = requireUser(await getSessionData(ctx));

      if (role) {
        roleGuard(role, user);
      }

      return await withRequiredUserContext(ctx, user);
    })
  );

export const createAuthMutation = ({ role }: { role?: "admin" }) =>
  zCustomMutation(
    mutation,
    customCtx(async (ctx) => {
      const user = requireUser(
        await getSessionData(ctx),
        MUTATION_AUTH_REQUIRED_ERROR
      );

      if (role) {
        roleGuard(role, user);
      }

      return await withRequiredUserContext(ctx, user);
    })
  );
