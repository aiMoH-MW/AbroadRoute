"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandSignatures";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
      setResendCooldown(60);

      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to generate password reset request. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between selection:bg-[#D89A3E]/20">
      {/* Top Navbar */}
      <header className="border-b border-[#D9CFB8]/60 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo variant="wordmark" theme="light" size="md" />
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-[#1D5A6C] flex items-center gap-1 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200/60 text-[#EA5C2B]">
                  <Mail className="h-6 w-6" />
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Forgot Password?
                </h1>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Enter your registered account email and we&apos;ll send you
                  instructions to reset your password.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative rounded-lg border border-slate-200 bg-white transition focus-within:border-[#102C57] focus-within:ring-2 focus-within:ring-[#102C57]/10">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@abroadroute.com or student@example.com"
                      className="w-full rounded-lg py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#102C57] py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0c2242] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying account...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success View */
            <div className="text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                Reset Link Verified!
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                If an account exists for this email, we&apos;ve sent a password
                reset link to:
              </p>
              <p className="mt-1 text-xs font-bold text-[#102C57] bg-slate-100 py-1.5 px-3 rounded-lg font-mono">
                {email}
              </p>
              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                Open the link in that email to choose a new password. It can
                only be used once and expires after a short time. Check your
                spam folder if you don&apos;t see it.
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading || resendCooldown > 0}
                  className="w-full rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Link"}
                </button>

                <Link
                  href="/login"
                  className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Footer Back Link */}
          {!submitted && (
            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              <span>Remembered your password? </span>
              <Link
                href="/login"
                className="font-bold text-[#EA5C2B] hover:underline"
              >
                Sign in →
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-3 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>
          Secured via Supabase Auth & DPDP Act 2023 End-to-End Encryption
        </span>
      </footer>
    </div>
  );
}
