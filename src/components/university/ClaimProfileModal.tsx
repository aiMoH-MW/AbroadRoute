"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  MailCheck,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAuthHeaders } from "@/lib/supabase/client";

interface Props {
  universityId: string;
  universityName: string;
  countryId?: string;
  countrySlug?: string;
  countryName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

type Step = "details" | "otp";

export function ClaimProfileModal({
  universityId,
  universityName,
  countryId,
  countrySlug,
  countryName,
  isOpen,
  onClose,
  onSubmitted,
}: Props) {
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("details");
  const [applicantName, setApplicantName] = useState(user?.name || "");
  const [officialEmail, setOfficialEmail] = useState(user?.email || "");
  const [designation, setDesignation] = useState(
    "Director of International Admissions",
  );
  const [proofUrl, setProofUrl] = useState("");

  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Countdown for the code's validity window.
  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, secondsLeft]);

  // Reset back to a clean form whenever the modal is closed.
  useEffect(() => {
    if (!isOpen) {
      setStep("details");
      setOtp("");
      setDevOtp("");
      setError("");
      setSuccess(false);
      setSecondsLeft(0);
    }
  }, [isOpen]);

  // Hooks must run on every render, so the visibility check comes after them.
  if (!isOpen) return null;

  const claimPayload = {
    universityId,
    universityName,
    countryId: countryId || countrySlug,
    countrySlug: countrySlug || countryId,
    countryName,
    applicantName: applicantName.trim(),
    officialEmail: officialEmail.trim(),
    designation: designation.trim(),
    proofDocumentUrl: proofUrl.trim(),
  };

  const requestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!officialEmail.includes("@")) {
      setError("Please enter a valid institutional email address.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/claims/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId,
          universityName,
          officialEmail: officialEmail.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        return;
      }

      setDevOtp(data.devOtp || "");
      setOtp("");
      setSecondsLeft(data.expiresInSeconds || 0);
      setStep("otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      // The claim belongs to the signed-in account (login token)
      const res = await fetch("/api/claims/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ ...claimPayload, otp: otp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit claim request.");
        // An expired or exhausted code needs a fresh one.
        if (data.otpFailed && /expired|new code/i.test(data.error || "")) {
          setDevOtp("");
          setSecondsLeft(0);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to submit claim request.");
    } finally {
      setLoading(false);
    }
  };

  const mmss =
    Math.floor(secondsLeft / 60) +
    ":" +
    String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-[#D9CFB8] bg-[#FDFCF7] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D9CFB8]/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#103B47] text-white">
              <ShieldCheck className="h-5 w-5 text-[#D89A3E]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#103B47]">
                {step === "details"
                  ? "Claim Official Profile"
                  : "Verify Your Email"}
              </h2>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                {universityName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notices */}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Claim submitted! Admin review pending in /admin queue.</span>
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1 - applicant details */}
        {step === "details" && (
          <form onSubmit={requestOtp} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Your Full Name
              </label>
              <div className="relative rounded-xl border border-[#D9CFB8] bg-white transition focus-within:border-[#103B47] focus-within:ring-1 focus-within:ring-[#103B47]">
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Dr. Sahil Pattankude"
                  className="w-full min-h-[44px] rounded-xl py-2 px-3 text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Institutional Email
              </label>
              <div className="relative rounded-xl border border-[#D9CFB8] bg-white transition focus-within:border-[#103B47] focus-within:ring-1 focus-within:ring-[#103B47]">
                <input
                  type="email"
                  required
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="admissions@university.edu"
                  className="w-full min-h-[44px] rounded-xl py-2 px-3 text-slate-900 font-medium focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Must match institutional domain (e.g. @tum.de or @stanford.edu)
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Designation
              </label>
              <div className="relative rounded-xl border border-[#D9CFB8] bg-white transition focus-within:border-[#103B47] focus-within:ring-1 focus-within:ring-[#103B47]">
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Director of Admissions / Dean"
                  className="w-full min-h-[44px] rounded-xl py-2 px-3 text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Authorization Proof (ID / Verification Link)
              </label>
              <div className="relative rounded-xl border border-[#D9CFB8] bg-white transition focus-within:border-[#103B47] focus-within:ring-1 focus-within:ring-[#103B47]">
                <input
                  type="text"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://university.edu/staff/profile"
                  className="w-full min-h-[44px] rounded-xl py-2 px-3 text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#D9CFB8]/60">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] rounded-xl border border-[#D9CFB8] px-4 py-2 font-bold text-slate-600 hover:bg-white transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={sending}
                className="min-h-[44px] flex items-center gap-2 rounded-xl bg-[#103B47] px-5 py-2 font-bold text-white hover:bg-[#1D5A6C] transition disabled:opacity-50 cursor-pointer"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#D89A3E]" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <MailCheck className="h-4 w-4 text-[#D89A3E]" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2 - OTP verification */}
        {step === "otp" && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <p className="text-slate-600">
              We sent a 6-digit verification code to{" "}
              <span className="font-bold text-[#103B47]">{officialEmail}</span>.
            </p>

            {/* Placeholder delivery: no mail provider is wired up yet. */}
            {devOtp && (
              <div className="rounded-xl border border-[#D89A3E]/40 bg-[#D89A3E]/10 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#D89A3E]">
                  <KeyRound className="h-3.5 w-3.5" />
                  Email delivery not configured - showing code here
                </div>
                <div className="mt-2 text-center font-mono text-2xl font-black tracking-[0.4em] text-[#103B47]">
                  {devOtp}
                </div>
                <p className="mt-1.5 text-center text-[10px] text-slate-500">
                  This panel disappears once an email service is connected.
                </p>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Enter Verification Code
              </label>
              <div className="rounded-xl border border-[#D9CFB8] bg-white transition focus-within:border-[#103B47] focus-within:ring-1 focus-within:ring-[#103B47]">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full min-h-[44px] rounded-xl py-2.5 px-3 text-center font-mono text-lg font-black tracking-[0.4em] text-slate-900 focus:outline-none"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">
                  {secondsLeft > 0 ? "Code expires in " + mmss : "Code expired"}
                </span>
                <button
                  type="button"
                  onClick={() => requestOtp()}
                  disabled={sending}
                  className="font-bold text-[#D89A3E] hover:underline disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Resend code"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-[#D9CFB8]/60">
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                }}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl border border-[#D9CFB8] px-4 py-2 font-bold text-slate-600 hover:bg-white transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="min-h-[44px] flex items-center gap-2 rounded-xl bg-[#103B47] px-5 py-2 font-bold text-white hover:bg-[#1D5A6C] transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#D89A3E]" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-[#D89A3E]" />
                    <span>Submit Claim Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
