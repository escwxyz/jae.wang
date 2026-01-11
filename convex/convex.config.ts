import aggregate from "@convex-dev/aggregate/convex.config";
import r2 from "@convex-dev/r2/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import resend from "@convex-dev/resend/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(rateLimiter);
app.use(resend);
app.use(r2);
app.use(workpool, { name: "emailWorkpool" });

app.use(aggregate, { name: "aggregateUsers" });
app.use(aggregate, { name: "aggregatePosts" });
app.use(aggregate, { name: "aggregateCommentsByPost" });
app.use(aggregate, { name: "aggregateCommentsByUser" });

export default app;
