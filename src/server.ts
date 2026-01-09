/** biome-ignore-all lint/suspicious/useAwait: <ignore> */
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export interface MyRequestContext {
  ip: string | null;
  country: string | null;
  city: string | null;
  rayId: string | null;
  userAgent: string | null;
}

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: MyRequestContext;
    };
  }
}

export default createServerEntry({
  async fetch(request) {
    const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
    const context = {
      ip: request.headers.get("cf-connecting-ip"),
      country: cf?.country ?? request.headers.get("cf-ipcountry"),
      city: cf?.city ?? request.headers.get("cf-ipcity"),
      rayId: request.headers.get("cf-ray"),
      userAgent: request.headers.get("user-agent"),
    };

    return handler.fetch(request, { context });
  },
});
