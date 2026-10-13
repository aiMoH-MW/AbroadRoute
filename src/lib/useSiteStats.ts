"use client";

import { useEffect, useState } from "react";
import { EMPTY_SITE_STATS, type SiteStats } from "@/lib/siteStatsFormat";

// One request per page load, shared by every component that needs counts
let statsPromise: Promise<SiteStats> | null = null;

function loadSiteStats(): Promise<SiteStats> {
  if (!statsPromise) {
    statsPromise = fetch("/api/site-stats")
      .then((res) => res.json())
      .then((json) => (json.success ? json.stats : EMPTY_SITE_STATS))
      .catch(() => {
        statsPromise = null; // retry on the next mount
        return EMPTY_SITE_STATS;
      });
  }
  return statsPromise;
}

/** Site counts from the database; zeros until loaded (labels show without numbers). */
export function useSiteStats(): SiteStats {
  const [stats, setStats] = useState<SiteStats>(EMPTY_SITE_STATS);
  useEffect(() => {
    let active = true;
    loadSiteStats().then((s) => active && setStats(s));
    return () => {
      active = false;
    };
  }, []);
  return stats;
}
