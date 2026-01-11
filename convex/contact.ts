import { z } from "zod/v4";
import { internal } from "./_generated/api";
import { zActionWithSession, zInternalMutation } from "./functions";
import { contactFormFields, metadataFields } from "./schema";
import { emailWorkpool } from "./workpools";

export const create = zActionWithSession({
  args: z.object(contactFormFields),
  handler: async (ctx, args) => {
    const visitor = await ctx.runQuery(internal.visitor.getVisitor, {
      sessionId: ctx.sessionId,
    });

    const records = {
      ...args,
      ip: visitor?.ip,
      city: visitor?.city,
      country: visitor?.country,
      device: visitor?.device,
      currentPath: "/",
    };

    await ctx.runMutation(internal.contact.createInternal, {
      ...records,
    });

    // await emailWorkpool.enqueueMutation(
    //   ctx,
    //   internal.email.sendInquiryConfirmationEmail,
    //   {
    //     name: rest.name,
    //     emailAddress: rest.email,
    //     subject: rest.type,
    //     inquiryId: id,
    //     inquiryDate: new Date().toLocaleDateString("en-US", {
    //       year: "numeric",
    //       month: "long",
    //       day: "numeric",
    //     }),
    //   }
    // );

    await emailWorkpool.enqueueMutation(
      ctx,
      internal.email.sendNotificationEmail,
      {
        title: "你有一个新的询盘",
        content: `Email: ${args.email} \n Name: ${args.name} \n Message: ${args.message}`,
      }
    );

    await ctx.scheduler.runAfter(
      2000,
      internal.email.syncEmailToResendContact,
      {
        email: args.email,
        name: args.name,
      }
    );
  },
});

export const createInternal = zInternalMutation({
  args: z.object({
    ...contactFormFields,
    ...metadataFields,
  }),
  handler: async (ctx, args) => {
    return await ctx.db.insert("contact", args);
  },
});
