/** biome-ignore-all lint/suspicious/useAwait: <ignore> */
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { admin } from "better-auth/plugins"; // Optional plugins
import {
  type AuthFunctions,
  createApi,
  createClient,
} from "better-auth-convex";
import { asyncMap } from "convex-helpers";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import authConfig from "./auth.config";
import { getEnv } from "./helpers/getEnv";
import schema from "./schema";

export type GenericCtx = ActionCtx | MutationCtx | QueryCtx;

const authFunctions: AuthFunctions = internal.auth;

export const authClient = createClient<DataModel, typeof schema>({
  authFunctions,
  schema,
  triggers: {
    user: {
      beforeCreate: async (_ctx, authUser) => {
        const env = getEnv();
        const adminEmails = env.ADMIN;

        const role =
          authUser.role !== "admin" && adminEmails.includes(authUser.email)
            ? "admin"
            : authUser.role;

        return {
          ...authUser,
          role,
        };
      },
      onDelete: async (ctx, authUser) => {
        const user = await ctx.db.get(authUser._id);

        if (!user) {
          return;
        }

        const comments = await ctx.db
          .query("comment")
          .withIndex("by_author", (q) => q.eq("authorId", user._id))
          .collect();

        await asyncMap(comments, async (c) => {
          await ctx.db.delete(c._id);
        });
        await ctx.db.delete(user._id);
      },
    },
  },
});

export const createAuthOptions = (ctx: GenericCtx) =>
  ({
    baseURL: process.env.SITE_URL as string,
    account: {
      accountLinking: {
        enabled: true,
        updateUserInfoOnLink: true,
        trustedProviders: ["google", "github"],
      },
    },
    plugins: [
      convex({
        authConfig,
        // jwks: process.env.JWKS,
      }),
      admin(),
    ],
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session, ctx) => {
            const request = ctx?.request;
            if (!request) {
              return;
            }

            const userAgent = request.headers.get("user-agent") ?? "";
            // biome-ignore lint/performance/useTopLevelRegex: <ignore>
            const isMobile = /Mobi|Android|iPhone/i.test(userAgent);

            const cityHeader = request.headers.get("cf-ipcity");

            return {
              data: {
                ...session,
                country: request.headers.get("cf-ipcountry") ?? undefined,
                city: cityHeader ? decodeURIComponent(cityHeader) : undefined,
                isMobile,
              },
            };
          },
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24 * 15, // 15 days
      additionalFields: {
        country: {
          type: "string",
          required: false,
        },
        city: {
          type: "string",
          required: false,
        },
        isMobile: {
          type: "boolean",
          required: false,
        },
      },
    },
    database: authClient.httpAdapter(ctx),
    telemetry: { enabled: false },
    user: {
      // modelName: "users",
      fields: {
        image: "avatarUrl",
      },
      changeEmail: {
        enabled: false,
      },
      additionalFields: {
        website: {
          type: "string",
          required: false,
        },
      },
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: [
          "x-client-ip",
          "x-forwarded-for",
          "cf-connecting-ip",
        ],
      },
    },
  }) satisfies BetterAuthOptions;

// 4. Create auth instance
export const createAuth = (ctx: GenericCtx) =>
  betterAuth(createAuthOptions(ctx));

// biome-ignore lint/suspicious/noExplicitAny: <ignore>
export const auth = createAuth({} as any);

// 5. IMPORTANT: Use getAuth for queries/mutations (direct DB access)
export const getAuth = <Ctx extends QueryCtx | MutationCtx>(ctx: Ctx) => {
  return betterAuth({
    // biome-ignore lint/suspicious/noExplicitAny: <ignore>
    ...createAuthOptions({} as any),
    database: authClient.adapter(ctx, createAuthOptions),
  });
};

// 6. Export trigger handlers for Convex
export const {
  beforeCreate,
  beforeDelete,
  beforeUpdate,
  onCreate,
  onDelete,
  onUpdate,
} = authClient.triggersApi();

// 7. Export API functions for internal use
export const {
  create,
  deleteMany,
  deleteOne,
  findMany,
  findOne,
  updateMany,
  updateOne,
  getLatestJwks,
  rotateKeys,
} = createApi(schema, createAuth, {
  // Optional: Skip input validation for smaller generated types
  // Since these are internal functions, validation is optional
  skipValidation: true,
});

// Optional: If you need custom mutation builders (e.g., for custom context)
// Pass internalMutation to both createClient and createApi
// export const authClient = createClient<DataModel, typeof schema>({
//   authFunctions,
//   schema,
//   internalMutation: myCustomInternalMutation,
//   triggers: { ... }
// });
//
// export const { create, ... } = createApi(schema, createAuth, {
//   internalMutation: myCustomInternalMutation,
// });
