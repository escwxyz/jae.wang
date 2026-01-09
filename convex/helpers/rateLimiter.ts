// import { RateLimiter } from "@convex-dev/rate-limiter";
// import { components } from "../_generated/api";

// export const rateLimiter = new RateLimiter(components.rateLimiter, {});

// export function getRateLimitKey(
//   baseKey: string,
//   tier: "free" | "premium" | "public"
// ): string {
//   // For general limits without tiers and admin-only limits
//   if (["free", "premium", "public", "scraper", "vercel"].includes(baseKey)) {
//     return baseKey;
//   }

//   // For specific feature limits with tiers
//   return `${baseKey}:${tier}`;
// }

// export function getUserTier(
//   user: { isAdmin?: boolean; plan?: SessionUser["plan"] } | null
// ): "free" | "premium" | "public" {
//   if (!user) {
//     return "public";
//   }
//   if (user.isAdmin) {
//     return "premium"; // Admins bypass rate limits by getting premium tier
//   }
//   if (user.plan) {
//     return "premium";
//   }

//   return "free";
// }

// export async function rateLimitGuard(
//   ctx: (ActionCtx | MutationCtx) & {
//     rateLimitKey: string;
//     user: Pick<SessionUser, "id" | "plan"> | null;
//   }
// ) {
//   const tier = getUserTier(ctx.user);
//   const limitKey = getRateLimitKey(ctx.rateLimitKey, tier) as any;
//   const identifier = ctx.user?.id ?? "anonymous";

//   const status = await rateLimiter.limit(ctx, limitKey, {
//     key: identifier,
//   });

//   if (!status.ok) {
//     throw new ConvexError({
//       code: "TOO_MANY_REQUESTS",
//       message: "Rate limit exceeded. Please try again later.",
//       retryAfter: status.retryAfter,
//     });
//   }
// }
