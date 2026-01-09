import { createAuthQuery } from "./functions";

export const getCurrentUser = createAuthQuery({})({
  args: {},
  handler: (ctx) => {
    const { user } = ctx;

    return {
      id: user._id,
      isAdmin: user.isAdmin,
      name: user.name,
      avatarUrl: user.avatarUrl,
      website: user.website,
      createdAt: user.createdAt,
      country: user.session.country,
      city: user.session.city,
    };
  },
});
