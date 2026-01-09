import { zQueryWithSession } from "./functions";

export const list = zQueryWithSession({
  args: {},
  handler: async (ctx, _args) => {
    return await ctx.db.query("project").order("desc").collect();
  },
});
