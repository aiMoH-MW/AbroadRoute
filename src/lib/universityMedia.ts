// University logo and banner images, stored in a public Supabase bucket
// (migration 0019) and referenced from universities.logo_url / banner_url.

export const UNIVERSITY_MEDIA_BUCKET = "university-media";

export type UniversityMediaKind = "logo" | "banner";

export const UNIVERSITY_MEDIA_COLUMNS: Record<UniversityMediaKind, "logo_url" | "banner_url"> = {
  logo: "logo_url",
  banner: "banner_url",
};

export const UNIVERSITY_MEDIA_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const UNIVERSITY_MEDIA_MAX_BYTES: Record<UniversityMediaKind, number> = {
  logo: 2 * 1024 * 1024,
  banner: 5 * 1024 * 1024,
};

export const UNIVERSITY_MEDIA_HINTS: Record<UniversityMediaKind, string> = {
  logo: "Square PNG, JPG or WebP, up to 2 MB. Transparent PNG works best.",
  banner: "Wide campus photo (about 1600×500), PNG, JPG or WebP, up to 5 MB.",
};

export function isUniversityMediaKind(value: unknown): value is UniversityMediaKind {
  return value === "logo" || value === "banner";
}

/** Storage path of a file in our bucket, or null for any other URL. */
export function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${UNIVERSITY_MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}
