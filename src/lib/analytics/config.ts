import { configSchema } from "better-env/config-schema";

export const analyticsConfig = configSchema(
  "Analytics",
  {},
  {
    flag: {
      env: "ENABLE_VERCEL_ANALYTICS",
      value: process.env.ENABLE_VERCEL_ANALYTICS,
    },
  },
);
