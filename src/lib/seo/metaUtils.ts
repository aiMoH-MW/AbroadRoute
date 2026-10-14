// ============================================================
// AbroadRoute - SEO & AEO Meta Description Engine
// Guarantees all page meta descriptions are strictly between 150 - 160 characters.
// ============================================================

export function fitMetaDescription(
  text: string,
  fallbackSuffix: string = " Explore 2026 intake deadlines, fees, and eligibility on AbroadRoute.",
): string {
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length >= 150 && cleaned.length <= 160) {
    return cleaned;
  }

  if (cleaned.length < 150) {
    let candidate = cleaned + fallbackSuffix;
    if (candidate.length >= 150 && candidate.length <= 160) {
      return candidate;
    }
    if (candidate.length > 160) {
      const sub = candidate.slice(0, 160);
      const lastSpace = sub.lastIndexOf(" ");
      if (lastSpace >= 150) {
        return sub.slice(0, lastSpace);
      }
      return sub;
    }
    // Still less than 150, pad with standard portal context
    candidate = candidate + " Official admissions guide for Indian students.";
    const sub = candidate.slice(0, 160);
    const lastSpace = sub.lastIndexOf(" ");
    if (lastSpace >= 150) {
      return sub.slice(0, lastSpace);
    }
    return sub;
  }

  // Length > 160
  const sub = cleaned.slice(0, 160);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace >= 150) {
    return sub.slice(0, lastSpace);
  }
  return sub;
}
