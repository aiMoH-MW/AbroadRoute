"use client";

import { getAuthHeaders } from "@/lib/supabase/client";

/**
 * fetch() for our admin API routes: adds the signed-in user's bearer token,
 * which every /api/admin handler checks (requireAdmin).
 */
export async function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(await getAuthHeaders())) {
    headers.set(key, value);
  }
  return fetch(input, { ...init, headers });
}
