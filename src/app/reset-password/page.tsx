"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { supabase } from "@/lib/supabase/client";

// Only reachable through the one-time link Supabase emails from
// /forgot-password: the link signs the browser in with a short-lived
// recovery session, and the new password is set for that session's user.
function ResetPasswordForm() {
  const searchParams = useSearchParams();

  // "checking" until the recovery link has been processed
  const [linkState, setLinkState] = useState<"checking" | "ready" | "invalid">(
    "checking",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    // Implicit-flow links put the session in the URL hash, which supabase-js
    // reads on load and reports as PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === "PASSWORD_RECOVERY" && session) {
        setLinkState("ready");
      }
    });

    (async () => {
      // PKCE-flow links arrive with ?code=...
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        setLinkState(error ? "invalid" : "ready");
        return;
      }
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash.includes("error")) {
        setLinkState("invalid");
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session && hash.includes("type=recovery")) {
        setLinkState("ready");
      } else if (!hash.includes("access_token")) {
        setLinkState("invalid");
      }
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(
        updateError.message || "Failed to update password. Please try again.",
      );
      setLoading(false);
      return;
    }
    // End the recovery session; the user signs in with the new password
    await supabase.auth.signOut();
    setSuccess(true);
    setLoading(false);
  };

  if (linkState !== "ready" && !success) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        {linkState === "checking" ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#102C57]" />
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-xl font-bold text-slate-900">
              Reset link invalid or expired
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Open the most recent link from your password reset email, or
              request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="mt-5 inline-block w-full rounded-xl bg-[#102C57] py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      {!success ? (
        <>
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              Set New Password
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Create a new secure password for your account.
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
          <form onSubmit={handleReset} className="mt-5 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                New Password (min. 8 characters)
              </label>
              <div className="relative rounded-lg border border-slate-200 bg-white transition focus-within:border-[#102C57] focus-within:ring-2 focus-within:ring-[#102C57]/10 flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative rounded-lg border border-slate-200 bg-white transition focus-within:border-[#102C57] focus-within:ring-2 focus-within:ring-[#102C57]/10">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
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
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
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
            Password Updated!
          </h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Your password has been successfully reset. You can now log in to
            your account with your new password.
          </p>

          <div className="mt-6">
            <Link
              href="/login"
              className="w-full inline-block rounded-xl bg-[#102C57] py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition shadow-md"
            >
              Sign In Now →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between selection:bg-[#D89A3E]/20">
      {/* Top Navbar */}
      <header className="border-b border-[#D9CFB8]/60 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo variant="wordmark" theme="light" size="md" />
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-[#1D5A6C] transition"
          >
            ← Back to Sign In
          </Link>
        </div>
      </header>

      {/* Main Card wrapped in Suspense for useSearchParams */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#102C57]" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
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
