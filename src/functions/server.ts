import { createServerFn } from "@tanstack/react-start";
import { getToken } from "@/lib/auth-server";

export const getRequestContext = createServerFn({ method: "GET" }).handler(
  ({ context }) => ({
    ip: context.ip,
    country: context.country,
    city: context.city,
    rayId: context.rayId,
    userAgent: context.userAgent,
  })
);

export const getSessionToken = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getToken();
  }
);
