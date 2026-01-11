import { z } from "zod/v4";
import { SITE_NAME } from "@/constants";
import { internal } from "./_generated/api";
import { zInternalAction, zInternalMutation } from "./functions";
import { rateLimiter } from "./helpers/rateLimiter";
import { resend } from "./resend";

const RESEND_RATE_LIMIT_KEY = "resend-global";

export const sendNotificationEmail = zInternalMutation({
  args: z.object({
    title: z.string(),
    content: z.string(),
  }),
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, "resendEmail", {
      key: RESEND_RATE_LIMIT_KEY,
    });

    if (!status.ok) {
      await ctx.scheduler.runAfter(
        status.retryAfter ?? 500,
        internal.email.sendNotificationEmail,
        args
      );
      return;
    }

    const siteConfig = await ctx.db.query("siteConfig").unique();

    let fromEmail = `${SITE_NAME} <hi@mail.jae.wang>`;

    if (siteConfig) {
      fromEmail = `${siteConfig.siteName} <hi@mail.jae.wang>`;
    }

    return await resend.sendEmail(ctx, {
      from: fromEmail,
      to: ["jay@llaveroswitch.com"],
      subject: args.title,
      html: args.content,
    });
  },
});

export const syncEmailToResendContact = zInternalAction({
  args: z.object({
    email: z.email(),
    unsubscribed: z.boolean().optional(),
    name: z.string().optional(),
  }),
  handler: async (_ctx, args) => {
    const status = await rateLimiter.limit(_ctx, "resendEmail", {
      key: RESEND_RATE_LIMIT_KEY,
    });

    if (!status.ok) {
      await _ctx.scheduler.runAfter(
        status.retryAfter ?? 500,
        internal.email.syncEmailToResendContact,
        args
      );
      return;
    }

    const url = "https://api.resend.com/contact";

    const headers = {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };

    const name = args.name?.split(" ");

    try {
      const existing = await fetch(`${url}/${args.email}`, {
        method: "GET",
        headers,
      });

      if (existing.ok) {
        // we update it
        const result = await fetch(`${url}/${args.email}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            unsubscribed: args.unsubscribed,
            first_name: name?.[0] ?? null,
            last_name: name?.[1] ?? null,
          }),
        });

        if (!(result.ok || result.ok)) {
          throw new Error(`Failed to update Resend contact for ${args.email}`);
        }
      }

      // we create it
      const result = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: args.email,
          unsubscribed: args.unsubscribed,
          first_name: name?.[0] ?? null,
          last_name: name?.[1] ?? null,
        }),
      });

      if (!result.ok) {
        throw new Error(`Failed to create Resend contact for ${args.email}`);
      }
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : "Failed to sync to Resend contact"
      );
    }
  },
});
