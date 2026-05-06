// Scheduled jobs.
//   pipeline:daily — recomputes Lead / Active / VIP / At-risk for every customer
//   that hasn't had a manual override.

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "pipeline:daily",
  "0 4 * * *", // 04:00 UTC every day
  internal.customers.recomputePipeline
);

export default crons;
