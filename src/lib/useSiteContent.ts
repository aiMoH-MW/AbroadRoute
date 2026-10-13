"use client";

import { useEffect, useState } from "react";

// Client access to the public site content API (/api/site-content/<kind>).
// One request per kind per page load, shared by every component using it.

const cache = new Map<string, Promise<unknown>>();

function loadContent<T>(kind: string, empty: T): Promise<T> {
  if (!cache.has(kind)) {
    cache.set(
      kind,
      fetch(`/api/site-content/${kind}`)
        .then((res) => res.json())
        .then((json) => (json.success ? json.data : empty))
        .catch(() => {
          cache.delete(kind); // retry on the next mount
          return empty;
        }),
    );
  }
  return cache.get(kind) as Promise<T>;
}

/** Site content of one kind; `empty` until loaded or when unavailable. */
export function useSiteContent<T>(kind: string, empty: T): T {
  const [data, setData] = useState<T>(empty);
  useEffect(() => {
    let active = true;
    loadContent(kind, empty).then((d) => active && setData(d));
    return () => {
      active = false;
    };
    // `empty` is a constant fallback; only the kind decides what to load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
  return data;
}

/** site_settings values; missing keys are undefined. */
export function useSiteSettings(): Record<string, string | null> {
  return useSiteContent<Record<string, string | null>>("site-settings", {});
}
