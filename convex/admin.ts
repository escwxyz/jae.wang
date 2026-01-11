import { aggregateUsers } from "./aggregates";
import { createAuthQuery } from "./functions";

export const getStats = createAuthQuery({ role: "admin" })({
  args: {},
  handler: async (ctx, _args) => {
    const recentUsers = (await ctx.db.query("user").order("desc").take(5)).map(
      ({ _id, _creationTime, avatarUrl, name }) => ({
        _id,
        _creationTime,
        avatarUrl,
        name,
      })
    );

    const totalUsers = await aggregateUsers.count(ctx, {
      //   bounds: {} as any,
      namespace: "global",
    });

    return {
      recentUsers,
      totalUsers,
    };
  },
});
