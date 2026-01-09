import { createFileRoute } from "@tanstack/react-router";
import { handler } from "@/lib/auth-server";

function withCloudflareHeaders(
  request: Request,
  context?: {
    ip: string | null;
    country: string | null;
    city: string | null;
    rayId: string | null;
    userAgent: string | null;
  }
) {
  if (!context) {
    return request;
  }

  const headers = new Headers(request.headers);

  if (!headers.has("cf-connecting-ip") && context.ip) {
    headers.set("cf-connecting-ip", context.ip);
  }

  if (!headers.has("cf-ipcountry") && context.country) {
    headers.set("cf-ipcountry", context.country);
  }

  if (!headers.has("cf-ipcity") && context.city) {
    headers.set("x-cf-city", encodeURIComponent(context.city));
  }

  if (!headers.has("user-agent") && context.userAgent) {
    headers.set("user-agent", context.userAgent);
  }

  return new Request(request, { headers });
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request, context }) =>
        handler(withCloudflareHeaders(request, context)),
      POST: ({ request, context }) =>
        handler(withCloudflareHeaders(request, context)),
    },
  },
});
