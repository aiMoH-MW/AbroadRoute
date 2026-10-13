import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

    // Country and organisation: what the user entered, else the university
    // whose official email domain matches theirs; null when neither is known
    const emailDomain = email.includes("@")
      ? email.split("@")[1].toLowerCase().trim()
      : "";
    let matchedUni: {
      name: string;
      country_id: string | null;
      countries: { name: string } | null;
    } | null = null;
    if (emailDomain && (!countrySlug || !organization?.trim())) {
      const { data: uniMatch } = await supabaseAdmin
        .from("universities")
        .select("name, country_id, countries(name)")
        .eq("official_email_domain", emailDomain)
        .limit(1);
      matchedUni = (uniMatch?.[0] as any) ?? null;
    }

    const finalCountrySlug = countrySlug || matchedUni?.country_id || null;
    const finalCountryName = countryName || matchedUni?.countries?.name || null;
    const finalOrg = organization?.trim() || matchedUni?.name || null;

    // Normal sign-up: Supabase emails a confirmation link, and the account
    // can't sign in until the address is confirmed. (Creating users through
    // the admin API with email_confirm: true let anyone register with an
    // email they don't own.)
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const publicAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    ).auth;
    const { data, error } = await publicAuth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: `${origin}/login?verified=1`,
        data: {
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
      },
    });

    if (data?.user?.id && safeRole === "university" && finalOrg) {
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
      // False when the account must confirm its email before signing in
      emailConfirmed: Boolean(data.user?.email_confirmed_at),
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
        role: data.user?.user_metadata?.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 },
    );
  }
}
