import { Analytics } from "@vercel/analytics/next";

import { analyticsConfig } from "@/lib/analytics/config";

export function VercelAnalytics() {
  if (!analyticsConfig.isEnabled) {
    return null;
  }
  return <Analytics />;
}
