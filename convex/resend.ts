import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

export const resend: Resend = new Resend(components.resend, {
  testMode: process.env.NODE_ENV === "development",
  apiKey: process.env.RESEND_API_KEY,
});
