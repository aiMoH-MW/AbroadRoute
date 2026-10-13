/**
 * User-isolated Cookie and Supabase Backend persistence for saved university shortlists.
 * Keys are scoped per user email (e.g. `vista_saved_shortlist_student1_gmail_com`) or `vista_saved_shortlist_guest`.
 */

import { getAuthHeaders } from "@/lib/supabase/client";

// Shortlist API calls carry the login token; the server takes the user
// from it (never from ids or emails in the request)
async function shortlistApi(url: string, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
  });
}

const MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 1 year

/**
 * Extracts and normalizes the active user's email for key scoping.
 */
export function getActiveUserEmail(
  user?: { email?: string } | string | null,
): string | null {
  if (typeof user === "string" && user.trim()) {
    return user.trim().toLowerCase();
  }
  if (user && typeof user === "object" && user.email && user.email.trim()) {
    return user.email.trim().toLowerCase();
  }
  return null;
}

/**
 * Generates the scoped storage key name.
 */
export function getShortlistKey(
  user?: { email?: string } | string | null,
): string {
  const email = getActiveUserEmail(user);
  if (email) {
    const sanitized = email.replace(/[^a-z0-9]/g, "_");
    return `vista_saved_shortlist_${sanitized}`;
  }
  return "vista_saved_shortlist_guest";
}

/**
 * Parses all browser cookies into a key-value record.
 */
function parseCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const cookies: Record<string, string> = {};
  const cookieStr = document.cookie || "";

  cookieStr.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    if (name) {
      const trimmedName = name.trim();
      const value = rest.join("=").trim();
      cookies[trimmedName] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * Reads the list of shortlisted university slugs for the specific user/guest from cookies/localStorage.
 */
export function getSavedShortlist(
  user?: { email?: string } | string | null,
): string[] {
  if (typeof window === "undefined") return [];

  const key = getShortlistKey(user);

  try {
    const cookies = parseCookies();
    const cookieVal = cookies[key];

    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Check localStorage fallback for this key
    const localVal = localStorage.getItem(key);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to parse shortlist:", err);
  }

  return [];
}

/**
 * Writes the list of university slugs to user-scoped cookie and localStorage.
 */
export function setSavedShortlist(
  slugs: string[],
  user?: { email?: string } | string | null,
  options?: { silent?: boolean },
): void {
  if (typeof document === "undefined") return;

  const key = getShortlistKey(user);

  try {
    const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
    const previousSlugs = getSavedShortlist(user);

    const hasChanged =
      uniqueSlugs.length !== previousSlugs.length ||
      uniqueSlugs.some((s) => !previousSlugs.includes(s));

    const jsonStr = encodeURIComponent(JSON.stringify(uniqueSlugs));
    const isSecure = window.location.protocol === "https:";

    // Set cookie
    document.cookie = `${key}=${jsonStr}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${
      isSecure ? "; Secure" : ""
    }`;

    // Set localStorage
    try {
      localStorage.setItem(key, JSON.stringify(uniqueSlugs));
    } catch {
      // ignore
    }

    // Dispatch global event
    if (!options?.silent && hasChanged) {
      const email = getActiveUserEmail(user);
      window.dispatchEvent(
        new CustomEvent("vista_shortlist_updated", {
          detail: { slugs: uniqueSlugs, email },
        }),
      );
    }
  } catch (err) {
    console.warn("Failed to set shortlist:", err);
  }
}

/**
 * Adds a university slug to the user's scoped shortlist and persists to Supabase backend if authenticated.
 */
export function addToShortlist(
  slug: string,
  user?: { id?: string; email?: string } | null,
): string[] {
  if (!slug) return getSavedShortlist(user);
  const current = getSavedShortlist(user);
  let updated = current;
  if (!current.includes(slug)) {
    updated = [...current, slug];
    setSavedShortlist(updated, user);
  }

  // If user is authenticated, persist to Supabase backend
  if (user && (user.id || user.email)) {
    shortlistApi("/api/shortlist", {
      method: "POST",
      body: JSON.stringify({ slug }),
    }).catch((err) => console.warn("Backend shortlist add error:", err));
  }

  return updated;
}

/**
 * Removes a university slug from the user's scoped shortlist and deletes from Supabase backend.
 */
export function removeFromShortlist(
  slug: string,
  user?: { id?: string; email?: string } | null,
): string[] {
  if (!slug) return getSavedShortlist(user);
  const current = getSavedShortlist(user);
  const updated = current.filter((s) => s !== slug);
  setSavedShortlist(updated, user);

  // If user is authenticated, delete from Supabase backend
  if (user && (user.id || user.email)) {
    shortlistApi("/api/shortlist", {
      method: "DELETE",
      body: JSON.stringify({ slug }),
    }).catch((err) => console.warn("Backend shortlist remove error:", err));
  }

  return updated;
}

/**
 * Checks whether a given university slug is shortlisted in user's scoped storage.
 */
export function isUniversityShortlisted(
  slug: string,
  user?: { email?: string } | string | null,
): boolean {
  if (!slug) return false;
  const current = getSavedShortlist(user);
  return current.includes(slug);
}

/**
 * Clears shortlist cookies and storage for the current user and guest.
 */
export function clearShortlistCookie(
  user?: { email?: string } | string | null,
): void {
  if (typeof document === "undefined") return;

  try {
    const keysToClear = [
      getShortlistKey(user),
      "vista_saved_shortlist_guest",
      "vista_saved_shortlist",
    ];

    keysToClear.forEach((key) => {
      document.cookie = `${key}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });

    const email = getActiveUserEmail(user);
    window.dispatchEvent(
      new CustomEvent("vista_shortlist_updated", {
        detail: { slugs: [], email },
      }),
    );
  } catch (err) {
    console.warn("Failed to clear shortlist:", err);
  }
}

/**
 * Fetches user shortlists directly from Supabase backend for this authenticated user and saves to their scoped storage.
 */
export async function fetchBackendShortlist(user: {
  id?: string;
  email?: string;
}): Promise<string[]> {
  if (!user || (!user.id && !user.email)) return getSavedShortlist(user);

  try {
    const res = await shortlistApi("/api/shortlist");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.shortlists)) {
        setSavedShortlist(data.shortlists, user);
        return data.shortlists;
      }
    }
  } catch (err) {
    console.warn("Fetch backend shortlist failed:", err);
  }

  return getSavedShortlist(user);
}

/**
 * Explicitly syncs guest cookies with backend ONLY when explicitly requested.
 */
export async function syncShortlistWithBackend(user: {
  id?: string;
  email?: string;
}): Promise<string[]> {
  if (!user || (!user.id && !user.email)) return getSavedShortlist(user);

  const guestSlugs = getSavedShortlist(null);
  if (guestSlugs.length === 0) {
    return fetchBackendShortlist(user);
  }

  try {
    const res = await shortlistApi("/api/shortlist/sync", {
      method: "POST",
      body: JSON.stringify({ slugs: guestSlugs }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.shortlists)) {
        setSavedShortlist(data.shortlists, user, { silent: true });
        clearShortlistCookie(null);
        return data.shortlists;
      }
    }
  } catch (err) {
    console.warn("Shortlist sync with backend failed:", err);
  }

  return getSavedShortlist(user);
}
