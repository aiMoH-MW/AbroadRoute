import "server-only";

// Simple fixed-window rate limiter kept in server memory. It resets on
// restart and each server instance counts separately, so it slows abuse
// down rather than guaranteeing a hard limit; move it to a shared store
// (e.g. a database table or Redis) when the site runs on several instances.

const globalForLimits = globalThis as unknown as {
  __rateLimits?: Map<string, { count: number; resetAt: number }>;
};
const windows =
  globalForLimits.__rateLimits ?? new Map<string, { count: number; resetAt: number }>();
globalForLimits.__rateLimits = windows;

/** Counts one hit for `key`; false once `limit` hits happen within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (windows.size > 10_000) {
    for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
  }
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
