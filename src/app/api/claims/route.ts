import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: allClaims, error } = await supabaseAdmin
      .from("university_claims")
      .select("*")
      .order("created_at", { ascending: false });

    // Admins see every claim; everyone else only sees their own
    const userEmail = user.email?.toLowerCase();
    const data = isAdminUser(user)
      ? allClaims
      : (allClaims || []).filter(
          (c: any) =>
            c.user_id === user.id ||
            (!!userEmail && c.official_email?.toLowerCase() === userEmail),
        );

    if (error) {
      console.warn("Supabase claims fetch error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Country of each claim: its own country_id, else the claimed
    // university's (university_id holds either the university's id or slug).
    // Null when neither is known.
    const universityKeys = [
      ...new Set(
        (data || [])
          .filter((c: any) => !c.country_id && c.university_id)
          .map((c: any) => String(c.university_id)),
      ),
    ];
    const uuidKeys = universityKeys.filter((k) => UUID_RE.test(k));
    const [countriesRes, byIdRes, bySlugRes] = await Promise.all([
      supabaseAdmin.from("countries").select("id, name, code"),
      uuidKeys.length
        ? supabaseAdmin
            .from("universities")
            .select("id, slug, country_id")
            .in("id", uuidKeys)
        : Promise.resolve({ data: [] as any[] }),
      universityKeys.length
        ? supabaseAdmin
            .from("universities")
            .select("id, slug, country_id")
            .in("slug", universityKeys)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const countries = new Map(
      (countriesRes.data || []).map((c: any) => [c.id, c]),
    );
    const universityCountry = new Map<string, string>();
    for (const u of [...(byIdRes.data || []), ...(bySlugRes.data || [])]) {
      if (!u.country_id) continue;
      universityCountry.set(u.id, u.country_id);
      universityCountry.set(u.slug, u.country_id);
    }

    const claims = (data || []).map((c: any) => {
      const countryId =
        c.country_id || universityCountry.get(c.university_id) || null;
      const country = countryId ? countries.get(countryId) : undefined;

      return {
        id: c.id,
        universityId: c.university_id,
        universityName: c.university_name,
        countryId,
        countryCode: country?.code ?? null,
        countryName: country?.name ?? null,
        applicantName: c.applicant_name,
        officialEmail: c.official_email,
        designation: c.designation || null,
        proofDocumentUrl: c.proof_document_url,
        status: c.verification_status || "pending",
        createdAt: c.created_at
          ? new Date(c.created_at).toLocaleDateString()
          : null,
        userId: c.user_id,
      };
    });

    return NextResponse.json({ success: true, count: claims.length, claims });
  } catch (err: any) {
    console.error("API /api/claims error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
