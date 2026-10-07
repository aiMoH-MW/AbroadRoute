"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  Building2,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth, UserRole } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { fetchBackendShortlist } from "@/lib/cookies/shortlist";
import { BrandLogo } from "@/components/ui/BrandSignatures";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";

  const { login } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (redirectParam.includes("university")) {
      setActiveRoleTab("university");
    } else if (redirectParam.includes("buyer")) {
      setActiveRoleTab("buyer");
    } else if (redirectParam.includes("admin")) {
      setActiveRoleTab("admin");
    }
  }, [redirectParam]);

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
  };

  const detectRole = (userEmail: string): UserRole => {
    const lower = userEmail.toLowerCase();
    if (
      lower.includes("consult") ||
      lower.includes("agency") ||
      lower.includes("buyer") ||
      lower.includes("b2b") ||
      lower.includes("apex")
    )
      return "buyer";
    if (
      lower.includes(".edu") ||
      lower.includes(".ac.") ||
      lower.includes("uni") ||
      lower.includes("admissions") ||
      lower.includes("utoronto") ||
      lower.includes("toronto") ||
      lower.includes("tum.de") ||
      lower.includes("tcd.ie") ||
      lower.includes("tma.uz") ||
      lower.includes("hec.fr") ||
      lower.includes("psl.eu") ||
      lower.includes("tudelft.nl") ||
      lower.includes("uniroma1.it") ||
      lower.includes("auckland.ac.nz")
    )
      return "university";
    // Admin is never inferred client-side; it comes from app_metadata only
    return activeRoleTab === "admin" ? "student" : activeRoleTab;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const userEmail = email.trim();
    if (!userEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });

      if (signInError || !data?.user) {
        const errMsg = signInError?.message || "Invalid login credentials";
        if (
          errMsg.toLowerCase().includes("invalid login credentials") ||
          errMsg.toLowerCase().includes("invalid_grant") ||
          errMsg.toLowerCase().includes("invalid credentials")
        ) {
          setError(
            "Invalid email or password. Please check your credentials and try again.",
          );
        } else if (errMsg.toLowerCase().includes("email not confirmed")) {
          setError("Please confirm your email address before signing in.");
        } else {
          setError(errMsg);
        }
        setLoading(false);
        return;
      }

      const authedUser = data.user;
      const meta = authedUser.user_metadata || {};

      // 2. Determine user role. Admin comes only from server-controlled
      // app_metadata; user_metadata is user-editable and can't grant it.
      const metaRole =
        meta.role && meta.role !== "admin" ? (meta.role as UserRole) : null;
      let userRole: UserRole;
      if (authedUser.app_metadata?.role === "admin") {
        userRole = "admin";
      } else if (metaRole) {
        userRole = metaRole;
      } else if (redirectParam.includes("university")) {
        userRole = "university";
      } else if (redirectParam.includes("buyer")) {
        userRole = "buyer";
      } else {
        userRole = detectRole(userEmail);
      }

      // Dynamic default name
      const dynamicName =
        meta.name ||
        meta.full_name ||
        (meta.first_name
          ? `${meta.first_name} ${meta.last_name || ""}`.trim()
          : undefined) ||
        userEmail
          .split("@")[0]
          ?.replace(/[._-]/g, " ")
          ?.replace(/\b\w/g, (c) => c.toUpperCase()) ||
        "Member";

      // 3. Login into session
      login(
        authedUser.email || userEmail,
        userRole,
        dynamicName,
        authedUser.id,
        meta.organization,
        meta.country_name,
        meta,
      );

      // Fetch this specific student's shortlist from Supabase backend
      try {
        await fetchBackendShortlist({
          id: authedUser.id,
          email: authedUser.email || userEmail,
        });
      } catch {
        // ignore
      }

      // 4. Guaranteed routing per selected role and redirect param
      if (redirectParam && redirectParam.startsWith("/")) {
        window.location.href = redirectParam;
      } else if (userRole === "university") {
        window.location.href = "/portal/university";
      } else if (userRole === "buyer") {
        window.location.href = "/portal/buyer";
      } else if (userRole === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard/student";
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(
        err?.message ||
          "An unexpected error occurred during sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "linkedin") => {
    login(`student.${provider}@gmail.com`, "student", "Student Applicant");
    window.location.href = "/dashboard/student";
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between selection:bg-[#D89A3E]/20">
      {/* Top Navbar */}
      <header className="border-b border-[#D9CFB8]/60 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo variant="wordmark" theme="light" size="md" />
          <Link
            href="/"
            className="text-xs font-mono font-semibold text-[#6B6B6B] hover:text-[#103B47] transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EFE0] border border-[#D9CFB8] text-[#103B47]">
              <Compass className="h-6 w-6 text-[#D89A3E]" />
            </div>
            <h1 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#103B47]">
              Sign In to Your Portal
            </h1>
            <p className="mt-1 text-xs text-[#6B6B6B]">
              Select your role to access your dedicated workspace
            </p>
          </div>

          {/* 3 Role Selector Tabs */}
          <div className="mt-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-[#F5EFE0] border border-[#D9CFB8] p-1 text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => handleRoleTabChange("student")}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] transition cursor-pointer ${
                activeRoleTab === "student"
                  ? "bg-[#1D5A6C] text-white shadow-xs font-bold"
                  : "text-[#6B6B6B] hover:text-[#103B47]"
              }`}
            >
              <GraduationCap className="h-4 w-4 text-[#D89A3E]" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange("buyer")}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] transition cursor-pointer ${
                activeRoleTab === "buyer"
                  ? "bg-[#1D5A6C] text-white shadow-xs font-bold"
                  : "text-[#6B6B6B] hover:text-[#103B47]"
              }`}
            >
              <Briefcase className="h-4 w-4 text-[#A8CDBD]" />
              <span>B2B Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange("university")}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] transition cursor-pointer ${
                activeRoleTab === "university"
                  ? "bg-[#1D5A6C] text-white shadow-xs font-bold"
                  : "text-[#6B6B6B] hover:text-[#103B47]"
              }`}
            >
              <Building2 className="h-4 w-4 text-[#EBC783]" />
              <span>University</span>
            </button>
          </div>

          {/* Active Role Quick Banner */}
          <div className="mt-4 rounded-xl border border-[#A8CDBD]/40 bg-[#A8CDBD]/15 p-2.5 text-center text-xs">
            <span className="font-semibold text-[#103B47]">Logging into: </span>
            <strong className="text-[#103B47] font-mono">
              {activeRoleTab === "university"
                ? "🏛️ University Partner Portal (/portal/university)"
                : activeRoleTab === "buyer"
                  ? "🏢 B2B Consultant Lead Portal (/portal/buyer)"
                  : "🎓 Student Dashboard (/dashboard/student)"}
            </strong>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {/* Email + Password Form */}
          <form onSubmit={handleSignIn} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1">
                Official Email Address
              </label>
              <div className="relative rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] transition focus-within:border-[#1D5A6C] focus-within:ring-2 focus-within:ring-[#1D5A6C]/10">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeRoleTab === "university"
                      ? "admissions@university.edu"
                      : activeRoleTab === "buyer"
                        ? "consultant@agency.com"
                        : activeRoleTab === "admin"
                          ? "admin@abroadroute.com"
                          : "name@example.com"
                  }
                  className="min-h-[44px] w-full rounded-xl py-2.5 px-3.5 text-[#103B47] font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#103B47]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[#D89A3E] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] transition focus-within:border-[#1D5A6C] focus-within:ring-2 focus-within:ring-[#1D5A6C]/10">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-[44px] w-full rounded-xl py-2.5 px-3.5 text-[#103B47] font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[#6B6B6B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D9CFB8] text-[#1D5A6C] accent-[#1D5A6C]"
                />
                <span className="text-xs text-[#6B6B6B]">
                  Remember this session
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] mt-2 w-full rounded-xl bg-[#103B47] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#0B2830] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                {loading
                  ? "Verifying Credentials..."
                  : `Sign In to ${
                      activeRoleTab === "university"
                        ? "University Portal"
                        : activeRoleTab === "buyer"
                          ? "Consultant Portal"
                          : activeRoleTab === "admin"
                            ? "Admin Zone"
                            : "Student Dashboard"
                    } →`}
              </span>
            </button>
          </form>

          {/* Micro Footer */}
          <div className="mt-5 border-t border-[#D9CFB8]/60 pt-4 text-center text-xs text-[#6B6B6B]">
            <span>Need an institutional or consultant account? </span>
            <Link
              href="/signup"
              className="font-bold text-[#D89A3E] hover:underline"
            >
              Register here →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFCF7] flex flex-col items-center justify-center p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EFE0] border border-[#D9CFB8] text-[#103B47] mb-3 animate-pulse">
            <Compass className="h-6 w-6 text-[#D89A3E]" />
          </div>
          <p className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#103B47]" />
            Loading Portal Switchboard...
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
