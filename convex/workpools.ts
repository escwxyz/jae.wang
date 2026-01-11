import { Workpool } from "@convex-dev/workpool";
import { components } from "./_generated/api";

export const emailWorkpool = new Workpool(components.emailWorkpool, {
  // Resend: 2 requests / sec -> keep concurrency small to reduce retries.
  maxParallelism: 2,
});
