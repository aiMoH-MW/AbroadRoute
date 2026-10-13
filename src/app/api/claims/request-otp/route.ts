import { NextResponse } from "next/server";
import { checkClaimEmailDomain } from "@/lib/claims/domainCheck";
import { createOtp, otpKey, OTP_TTL_MS } from "@/lib/claims/otpStore";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Issues a verification code for a university profile claim.
 *
 * No email provider is integrated yet, so a code can't be delivered to the
 * official email. In local development (NODE_ENV !== "production") with
 * CLAIM_OTP_DEV_MODE="true", the code is returned and shown on screen for
 * testing. Everywhere else this endpoint refuses rather than pretending a
 * code was sent — returning the code would let anyone claim any university.
 */
const DEV_MODE =
  process.env.NODE_ENV !== "production" &&
  process.env.CLAIM_OTP_DEV_MODE === "true";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { universityId, universityName, officialEmail } = body;

    if (!officialEmail || !universityName) {
      return NextResponse.json(
        { error: "Official email and university name are required." },
        { status: 400 },
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(String(officialEmail))) {
      return NextResponse.json(
        { error: "Please enter a valid institutional email address." },
        { status: 400 },
      );
    }

    // At most 3 codes per email and 10 per IP every 10 minutes
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (
      !rateLimit(`claim-otp:email:${String(officialEmail).toLowerCase()}`, 3, 10 * 60_000) ||
      !rateLimit(`claim-otp:ip:${ip}`, 10, 10 * 60_000)
    ) {
      return NextResponse.json(
        { error: "Too many verification requests. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    // Reject a mismatched domain before issuing a code, so the applicant
    // finds out now rather than after typing in an OTP.
    const domainError = await checkClaimEmailDomain(
      universityId,
      universityName,
      officialEmail,
    );
    if (domainError) {
      return NextResponse.json({ error: domainError }, { status: 400 });
    }

    if (!DEV_MODE) {
      // TODO: create the code and email it once a mail provider exists.
      return NextResponse.json(
        {
          error:
            "Email verification for claims isn't available yet. Please contact us to verify your university account.",
        },
        { status: 503 },
      );
    }

    const { code } = createOtp(otpKey(officialEmail, universityId));
    return NextResponse.json({
      success: true,
      delivered: "devDisplay",
      devOtp: code,
      expiresInSeconds: OTP_TTL_MS / 1000,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to send verification code." },
      { status: 500 },
    );
  }
}
