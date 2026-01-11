import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

// Aggregate for users
export const aggregateUsers = new TableAggregate<{
  DataModel: DataModel;
  Key: null; // No sorting, just counting
  Namespace: string; // userId
  TableName: "user";
}>(components.aggregateUsers, {
  namespace: (doc) => doc._id,
  sortKey: () => null, // We only care about counting, not sorting
});

export const aggregatePosts = new TableAggregate<{
  DataModel: DataModel;
  Key: null; // No sorting, just counting
  Namespace: string; // postId
  TableName: "post";
}>(components.aggregatePosts, {
  namespace: (doc) => doc._id,
  sortKey: () => null, // We only care about counting, not sorting
});

// export const aggregateCommentsByPost = new TableAggregate<{
//   DataModel: DataModel;
//   Key: null;
//   Namespace: Id<"post">;
//   TableName: "comment";
// }>(components.aggregateCommentsByPost, {
//   namespace: (doc) => doc.postId,
//   sortKey: () => null,
// });
