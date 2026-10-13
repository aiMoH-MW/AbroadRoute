import { supabaseAdmin } from "@/lib/supabase/server";

function normalizeDomain(raw: string): string {
  return raw.includes("@")
    ? raw.split("@")[1].toLowerCase().trim()
    : raw.toLowerCase().trim();
}

/**
 * Resolves the institutional domain a claim's email must match, from the
 * university's official_email_domain (or official_email_address) in the
 * database. Returns "" when the university's domain is unknown.
 */
export async function resolveExpectedDomain(
  universityId: string,
  universityName: string,
): Promise<string> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      universityId || "",
    );
  // Match by id (uuid only, else Postgres rejects the filter), slug or name.
  // Values are quoted so names with commas or brackets stay one filter.
  const quote = (v: string) => `"${v.replace(/["\\]/g, "\\$&")}"`;
  const conditions = [
    universityId && `slug.eq.${quote(universityId)}`,
    isUuid && `id.eq.${universityId}`,
    universityName && `name.ilike.${quote(`%${universityName}%`)}`,
  ].filter(Boolean);
  if (conditions.length === 0) return "";

  try {
    const { data } = await supabaseAdmin
      .from("universities")
      .select("official_email_domain, official_email_address")
      .or(conditions.join(","))
      .limit(1);
    const uniData = data?.[0];
    if (uniData) {
      return normalizeDomain(
        uniData.official_email_domain || uniData.official_email_address || "",
      );
    }
  } catch (err) {
    console.warn("Claim domain lookup failed:", err);
  }

  return "";
}

/**
 * Returns an error message when the applicant's email domain does not
 * belong to the institution, or null when the check passes (including
 * when the expected domain is unknown).
 */
export async function checkClaimEmailDomain(
  universityId: string,
  universityName: string,
  officialEmail: string,
): Promise<string | null> {
  const expectedDomain = await resolveExpectedDomain(
    universityId,
    universityName,
  );
  const applicantDomain = (officialEmail.split("@")[1] || "")
    .toLowerCase()
    .trim();

  if (
    expectedDomain &&
    applicantDomain &&
    applicantDomain !== expectedDomain &&
    !applicantDomain.endsWith("." + expectedDomain)
  ) {
    return `Verification Failed: Your email domain (@${applicantDomain}) does not match the official institutional domain (@${expectedDomain}) for ${universityName}. Please use your official university email.`;
  }

  return null;
}
