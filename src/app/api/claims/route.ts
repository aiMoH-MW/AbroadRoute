import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const claims = (data || []).map((c: any) => {
      const rawCountry = c.country_id || "global";
      const uniIdLower = (c.university_id || c.university_name || "").toLowerCase();

      let countryId = rawCountry;
      if (countryId === "global") {
        if (uniIdLower.includes("melbourne") || uniIdLower.includes("unimelb") || uniIdLower.includes("sydney") || uniIdLower.includes("monash")) {
          countryId = "australia";
        } else if (uniIdLower.includes("toronto") || uniIdLower.includes("utoronto") || uniIdLower.includes("mcgill") || uniIdLower.includes("ubc")) {
          countryId = "canada";
        } else if (uniIdLower.includes("oxford") || uniIdLower.includes("cambridge") || uniIdLower.includes("imperial") || uniIdLower.includes("lse")) {
          countryId = "uk";
        } else if (uniIdLower.includes("stanford") || uniIdLower.includes("harvard") || uniIdLower.includes("mit") || uniIdLower.includes("columbia")) {
          countryId = "usa";
        } else if (uniIdLower.includes("tum") || uniIdLower.includes("munich") || uniIdLower.includes("heidelberg") || uniIdLower.includes("berlin")) {
          countryId = "germany";
        }
      }

      const countryCodeMap: Record<string, string> = {
        australia: "AU",
        canada: "CA",
        uk: "GB",
        usa: "US",
        germany: "DE",
        ireland: "IE",
        singapore: "SG",
        france: "FR",
        italy: "IT",
        russia: "RU",
      };

      const countryCode = countryCodeMap[countryId.toLowerCase()] || "UN";
      const formattedCountryName = countryId === "usa" ? "United States" : countryId === "uk" ? "United Kingdom" : countryId.charAt(0).toUpperCase() + countryId.slice(1);

      return {
        id: c.id,
        universityId: c.university_id,
        universityName: c.university_name,
        countryId,
        countryCode,
        countryName: formattedCountryName,
        applicantName: c.applicant_name,
        officialEmail: c.official_email,
        designation: c.designation || "Admissions Representative",
        proofDocumentUrl: c.proof_document_url,
        status: c.verification_status || "pending",
        createdAt: new Date(c.created_at || Date.now()).toLocaleDateString(),
        userId: c.user_id,
      };
    });

    return NextResponse.json({ success: true, count: claims.length, claims });
  } catch (err: any) {
    console.error("API /api/claims error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
