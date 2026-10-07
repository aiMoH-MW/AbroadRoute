import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      firstName,
      lastName,
      role,
      phone,
      organization,
      countrySlug,
      countryName,
      marketingOptIn,
    } = body;

    // Admin cannot be self-assigned at signup
    const SIGNUP_ROLES = ["student", "buyer", "university"];
    const safeRole = SIGNUP_ROLES.includes(role) ? role : "student";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    // Intelligent domain/name deduction for country if default or unspecified
    const lowerEmail = (email || "").toLowerCase();
    const lowerOrg = (organization || "").toLowerCase();

    let inferredCountrySlug = countrySlug;
    let inferredCountryName = countryName;

    if (!countrySlug || countrySlug === "germany") {
      if (
        lowerEmail.includes("holland") ||
        lowerEmail.includes("netherlands") ||
        lowerOrg.includes("holland") ||
        lowerOrg.includes("netherlands") ||
        lowerEmail.endsWith(".nl")
      ) {
        inferredCountrySlug = "netherlands";
        inferredCountryName = "Netherlands";
      } else if (
        lowerEmail.includes("toronto") ||
        lowerEmail.includes("canada") ||
        lowerOrg.includes("toronto") ||
        lowerOrg.includes("canada") ||
        lowerEmail.endsWith(".ca")
      ) {
        inferredCountrySlug = "canada";
        inferredCountryName = "Canada";
      } else if (
        lowerEmail.includes("oxford") ||
        lowerEmail.includes("cambridge") ||
        lowerOrg.includes("oxford") ||
        lowerEmail.endsWith(".ac.uk") ||
        lowerEmail.includes("uk.")
      ) {
        inferredCountrySlug = "uk";
        inferredCountryName = "United Kingdom";
      } else if (
        lowerEmail.includes("melbourne") ||
        lowerEmail.includes("sydney") ||
        lowerOrg.includes("melbourne") ||
        lowerEmail.endsWith(".edu.au")
      ) {
        inferredCountrySlug = "australia";
        inferredCountryName = "Australia";
      } else if (
        lowerEmail.includes("auckland") ||
        lowerEmail.includes("otago") ||
        lowerOrg.includes("auckland") ||
        lowerEmail.endsWith(".ac.nz")
      ) {
        inferredCountrySlug = "new-zealand";
        inferredCountryName = "New Zealand";
      } else if (
        lowerEmail.includes("stanford") ||
        lowerEmail.includes("harvard") ||
        lowerOrg.includes("stanford") ||
        lowerEmail.includes("usa") ||
        lowerEmail.includes("america")
      ) {
        inferredCountrySlug = "usa";
        inferredCountryName = "United States";
      } else if (lowerEmail.includes("ireland") || lowerEmail.endsWith(".ie")) {
        inferredCountrySlug = "ireland";
        inferredCountryName = "Ireland";
      } else if (
        lowerEmail.includes("singapore") ||
        lowerEmail.endsWith(".edu.sg")
      ) {
        inferredCountrySlug = "singapore";
        inferredCountryName = "Singapore";
      }
    }

    const finalCountrySlug = inferredCountrySlug || "germany";
    const finalCountryName = inferredCountryName || "Germany";

    const derivedOrgFromEmail = email.includes("@")
      ? email.split("@")[1].split(".")[0].charAt(0).toUpperCase() +
        email.split("@")[1].split(".")[0].slice(1) +
        " University"
      : "Verified University Partner";
    const finalOrg = organization?.trim() || derivedOrgFromEmail;

    // Create user via Supabase Admin API:
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name || `${firstName || ""} ${lastName || ""}`.trim(),
        first_name: firstName,
        last_name: lastName,
        role: safeRole,
        phone: phone ? `+91${phone}` : "",
        organization: finalOrg,
        country_slug: finalCountrySlug,
        country_name: finalCountryName,
        dpdp_consent: true,
        marketing_opt_in: !!marketingOptIn,
        shortlists: Array.isArray(body.shortlists) ? body.shortlists : [],
      },
    });

    if (data?.user?.id && safeRole === "university") {
      const uniSlug = finalOrg.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Create claim entry in pending state for admin review
      const { error: claimErr } = await supabaseAdmin
        .from("university_claims")
        .insert({
          university_id: uniSlug,
          university_name: finalOrg,
          country_id: finalCountrySlug,
          user_id: data.user.id,
          applicant_name: name || `${firstName || ""} ${lastName || ""}`.trim(),
          official_email: email.trim(),
          verification_status: "pending",
        });
      if (claimErr) {
        console.warn("university_claims insert error:", claimErr.message);
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        role: data.user.user_metadata?.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 },
    );
  }
}
