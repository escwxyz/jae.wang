import { createAuthQuery } from "./functions";

export const getCurrentUser = createAuthQuery({})({
  args: {},
  handler: (ctx) => {
    const { user } = ctx;

    const { session, ...rest } = user;

    return {
      ...rest,
      country: session.country,
      city: session.city,
    };
  },
});
