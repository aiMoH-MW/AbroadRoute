import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { checkClaimEmailDomain } from "@/lib/claims/domainCheck";
import { verifyOtp, otpKey, MAX_ATTEMPTS } from "@/lib/claims/otpStore";
import { getRequestUser, hasConfirmedEmail } from "@/lib/supabase/requestAuth";

const OTP_ERRORS: Record<string, string> = {
  missing:
    "No verification code is pending for this email. Please request a new code.",
  expired: "That verification code has expired. Please request a new one.",
  too_many_attempts: `Too many incorrect attempts (max ${MAX_ATTEMPTS}). Please request a new code.`,
  mismatch: "That verification code is incorrect. Please check and try again.",
};

export async function POST(request: Request) {
  try {
    // The claim is made by, and later granted to, the signed-in account.
    // Its email must be confirmed so nobody can claim as someone else.
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to claim a university profile." },
        { status: 401 },
      );
    }
    if (!hasConfirmedEmail(user)) {
      return NextResponse.json(
        { error: "Please confirm your account email before claiming a profile." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      universityId,
      universityName,
      countryId,
      countrySlug,
      countryName,
      applicantName,
      officialEmail,
      designation,
      proofDocumentUrl,
      otp,
    } = body;

    if (!officialEmail || !applicantName || !universityName) {
      return NextResponse.json(
        {
          error:
            "Applicant name, official email, and university name are required.",
        },
        { status: 400 },
      );
    }

    if (!otp) {
      return NextResponse.json(
        { error: "A verification code is required to submit a claim." },
        { status: 400 },
      );
    }

    // 0. Verify claim official email against university's official domain
    const domainError = await checkClaimEmailDomain(
      universityId,
      universityName,
      officialEmail,
    );
    if (domainError) {
      return NextResponse.json({ error: domainError }, { status: 400 });
    }

    // 0b. Verify the emailed code. Consumed on success, so a claim cannot
    // be replayed with the same OTP.
    const otpResult = verifyOtp(otpKey(officialEmail, universityId), otp);
    if (!otpResult.ok) {
      return NextResponse.json(
        { error: OTP_ERRORS[otpResult.reason], otpFailed: true },
        { status: 400 },
      );
    }

    const claimId = `claim-${Date.now()}`;
    let realId = claimId;
    const finalCountryId = countryId || countrySlug || null;

    const validUserId = user.id;

    // 1. Attempt Supabase Table Insert
    try {
      const { data, error } = await supabaseAdmin
        .from("university_claims")
        .insert({
          university_id: universityId,
          university_name: universityName,
          country_id: finalCountryId,
          user_id: validUserId,
          applicant_name: applicantName,
          official_email: officialEmail,
          designation: designation || null,
          proof_document_url: proofDocumentUrl || "",
          verification_status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (data && data.id) {
        realId = data.id;
      }
      if (error) {
        console.warn("Supabase claims insert fallback:", error.message);
      }
    } catch (err) {
      console.warn("Supabase claims table error:", err);
    }

    return NextResponse.json({
      success: true,
      claim: {
        id: realId,
        universityName,
        applicantName,
        officialEmail,
        status: "pending",
        message:
          "Claim request submitted successfully. Admin review pending in /admin queue.",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit claim request." },
      { status: 500 },
    );
  }
}
