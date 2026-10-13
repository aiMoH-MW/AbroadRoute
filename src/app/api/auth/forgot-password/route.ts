import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Same reply whether or not the account exists, so this endpoint can't be
// used to discover registered emails. The reset link is only ever emailed.
const GENERIC_REPLY = {
  success: true,
  message:
    "If an account exists for this email, a password reset link has been sent to it.",
};

/**
 * Starts a password reset: Supabase emails a one-time recovery link that
 * opens /reset-password with a recovery session. Nothing secret is returned.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    // Public-key client: resetPasswordForEmail sends the email itself and is
    // rate-limited by Supabase Auth
    const auth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    ).auth;

    const { error } = await auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${origin}/reset-password`,
    });
    if (error) {
      // Logged for us; the caller still gets the generic reply
      console.warn("Password reset email error:", error.message);
    }

    return NextResponse.json(GENERIC_REPLY);
  } catch (err: any) {
    console.error("POST /api/auth/forgot-password error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
