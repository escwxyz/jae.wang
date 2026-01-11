import { RateLimiter, SECOND } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  resendEmail: { kind: "fixed window", rate: 2, period: SECOND, capacity: 2 },
});

// export const getSendMessageRateLimit = queryWithSession({
//   args: z.object({}),
//   handler: async (ctx) =>
//     rateLimiter.check(ctx, "sendMessage", { key: ctx.sessionId }),
// });
