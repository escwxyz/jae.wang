import { Triggers } from "convex-helpers/server/triggers";

import type { DataModel } from "./_generated/dataModel";
import { aggregatePosts, aggregateUsers } from "./aggregates";

export const registerTriggers = () => {
  const triggers = new Triggers<DataModel>();

  // ===========================================
  // AGGREGATE MAINTENANCE TRIGGERS
  // ===========================================
  // These triggers automatically maintain aggregates when tables change
  // No manual aggregate updates needed in mutations!

  triggers.register("user", aggregateUsers.trigger());
  triggers.register("post", aggregatePosts.trigger());
  // triggers.register("comment", aggregateCommentsByPost.trigger());

  return triggers;
};
