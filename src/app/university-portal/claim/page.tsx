"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
  MailCheck,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  Clock,
  ExternalLink,
  Lock,
  Globe,
  Award,
} from "lucide-react";
import {
  fetchLiveUniversities,
  fetchLiveCountries,
} from "@/lib/supabase/dataFetchers";
import { University, Country } from "@/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAuthHeaders } from "@/lib/supabase/client";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { useSiteStats } from "@/lib/useSiteStats";
import { withCount } from "@/lib/siteStatsFormat";

type ClaimStep =
  "select_university" | "representative_info" | "verify_otp" | "confirmed";

export default function UniversityClaimPage() {
  const siteStats = useSiteStats();
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<ClaimStep>("select_university");
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Search & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [isCustomUni, setIsCustomUni] = useState(false);
  const [customUniName, setCustomUniName] = useState("");
  const [customCountry, setCustomCountry] = useState("Germany");
  const [customCity, setCustomCity] = useState("");

  // Representative Info
  const [applicantName, setApplicantName] = useState(user?.name || "");
  const [officialEmail, setOfficialEmail] = useState(user?.email || "");
  const [designation, setDesignation] = useState(
    "Director of International Admissions",
  );
  const [phone, setPhone] = useState("+49 89 289 01");
  const [proofUrl, setProofUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [agreementSigned, setAgreementSigned] = useState(false);

  // OTP Verification
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccessData, setClaimSuccessData] = useState<any>(null);

  // Load Catalog
  useEffect(() => {
    async function loadData() {
      try {
        const [unis, cnts] = await Promise.all([
          fetchLiveUniversities(),
          fetchLiveCountries(),
        ]);
        setUniversities(unis || []);
        setCountries(cnts || []);
      } catch (err) {
        console.warn("Failed to load catalog for claims:", err);
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadData();
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (step !== "verify_otp" || secondsLeft <= 0) return;
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [step, secondsLeft]);

  // Filtered universities
  const filteredUnis = universities.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    );
  });

  const activeUniName = selectedUni
    ? selectedUni.name
    : customUniName || "Selected University";
  const activeUniSlug = selectedUni
    ? selectedUni.slug || selectedUni.id
    : "custom-uni-" + Date.now();
  const activeUniCountry = selectedUni ? selectedUni.country : customCountry;

  // Step 1 -> Step 2
  const handleProceedToDetails = (uni?: University) => {
    if (uni) {
      setSelectedUni(uni);
      setIsCustomUni(false);
    }
    if (!selectedUni && !uni && !customUniName.trim()) {
      setClaimError(
        "Please select an institution or enter your university name.",
      );
      return;
    }
    setClaimError("");
    setStep("representative_info");
  };

  // Step 2 -> Request OTP -> Step 3
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError("");

    if (!officialEmail.includes("@")) {
      setClaimError("Please enter a valid institutional email address.");
      return;
    }

    if (!agreementSigned) {
      setClaimError(
        "Please check the authorization declaration before proceeding.",
      );
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/claims/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId: activeUniSlug,
          universityName: activeUniName,
          officialEmail: officialEmail.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setClaimError(
          data.error ||
            "Failed to send verification code. Please ensure your email domain matches the institution.",
        );
        return;
      }

      setDevOtp(data.devOtp || "");
      setOtp("");
      setSecondsLeft(data.expiresInSeconds || 300);
      setStep("verify_otp");
    } catch (err: any) {
      setClaimError(err?.message || "Failed to send verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 3 -> Submit Claim -> Confirmed
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError("");

    if (otp.trim().length !== 6) {
      setClaimError(
        "Please enter the 6-digit verification code sent to your email.",
      );
      return;
    }

    setSubmittingClaim(true);
    try {
      // The claim belongs to the signed-in account (login token)
      const res = await fetch("/api/claims/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          universityId: activeUniSlug,
          universityName: activeUniName,
          countryName: activeUniCountry,
          countrySlug: selectedUni?.countrySlug || customCountry.toLowerCase(),
          applicantName: applicantName.trim(),
          officialEmail: officialEmail.trim(),
          designation: designation.trim(),
          proofDocumentUrl: proofUrl.trim() || uploadedFileName,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setClaimError(data.error || "Failed to verify code and submit claim.");
        return;
      }

      setClaimSuccessData({
        claimId: data.claim?.id || `CLM-${Date.now().toString().slice(-6)}`,
        universityName: activeUniName,
        email: officialEmail,
        applicant: applicantName,
        submittedAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });
      setStep("confirmed");
    } catch (err: any) {
      setClaimError(
        err?.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setSubmittingClaim(false);
    }
  };

  // File upload simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
    }
  };

  const mmss =
    Math.floor(secondsLeft / 60) +
    ":" +
    String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col selection:bg-[#D89A3E]/20">
      {/* Top Header */}
      <header className="border-b border-[#D9CFB8]/60 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo variant="wordmark" theme="light" size="md" />
            <span className="rounded-full bg-[#1D5A6C]/10 px-3 py-1 text-[11px] font-bold text-[#1D5A6C]">
              Institutional Verification
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/portal/university"
              className="font-bold text-[#1D5A6C] hover:text-[#103B47] transition hidden sm:inline-block"
            >
              University Portal Console →
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Ribbon */}
      <div className="bg-[#102C57] text-white border-b border-indigo-900/40">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-200 mb-3 backdrop-blur-xs">
            <ShieldCheck className="h-4 w-4 text-[#EA5C2B]" />
            <span>Official Institutional Verification · FR-UNI-001</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
            Claim Your University Profile
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Verify official representation of your institution to update degree
            programs, tuition fees, application deadlines, and connect directly
            with high-intent Indian applicants.
          </p>

          {/* Stepper Wizard Indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${step === "select_university" ? "bg-white text-[#102C57]" : "bg-white/10 text-indigo-200"}`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA5C2B] text-white text-[10px]">
                1
              </span>
              <span>Select Institution</span>
            </div>
            <div className="text-indigo-400">→</div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${step === "representative_info" ? "bg-white text-[#102C57]" : "bg-white/10 text-indigo-200"}`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA5C2B] text-white text-[10px]">
                2
              </span>
              <span>Official Verification</span>
            </div>
            <div className="text-indigo-400">→</div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${step === "verify_otp" || step === "confirmed" ? "bg-white text-[#102C57]" : "bg-white/10 text-indigo-200"}`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA5C2B] text-white text-[10px]">
                3
              </span>
              <span>2FA & SLA Approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {claimError && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">Verification Notice</p>
              <p className="mt-0.5">{claimError}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Select University */}
        {step === "select_university" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-[#102C57] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#EA5C2B]" />
                Step 1: Select Your Listed University
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Search from our directory of global universities
                {siteStats.countries > 0 &&
                  ` across ${withCount(siteStats.countries, "destinations")}`}
                .
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university by name (e.g. TUM, Stanford, Oxford, Melbourne, Toronto)..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#102C57] focus:bg-white focus:outline-none transition"
              />
            </div>

            {/* University Grid */}
            {loadingCatalog ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#102C57] mb-2" />
                Loading global university catalog...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-96 overflow-y-auto pr-1">
                {filteredUnis.slice(0, 12).map((u) => {
                  const isSelected =
                    selectedUni?.id === u.id || selectedUni?.slug === u.slug;
                  return (
                    <div
                      key={u.id || u.slug}
                      onClick={() => {
                        setSelectedUni(u);
                        setIsCustomUni(false);
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition text-left flex flex-col justify-between ${
                        isSelected
                          ? "border-[#102C57] bg-indigo-50/40 ring-2 ring-[#102C57]/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            QS Rank {u.rankingGlobal !== null ? `#${u.rankingGlobal}` : "not provided"}
                          </span>
                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#102C57] text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <h4 className="mt-2 text-xs font-bold text-[#102C57] line-clamp-1">
                          {u.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>
                            {u.city ? `${u.city}, ` : ""}
                            {u.country}
                          </span>
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {u.programsOffered?.length || 3}+ Degree Programs
                        </span>
                        <span className="font-semibold text-emerald-700">
                          Listing Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Or custom university listing */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">
                  Can't find your institution in the directory?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomUni(!isCustomUni);
                    setSelectedUni(null);
                  }}
                  className="text-xs font-bold text-[#EA5C2B] hover:underline"
                >
                  {isCustomUni
                    ? "Choose from catalog instead"
                    : "+ Add unlisted institution"}
                </button>
              </div>

              {isCustomUni && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs animate-in fade-in">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Institution Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customUniName}
                      onChange={(e) => setCustomUniName(e.target.value)}
                      placeholder="e.g. Erasmus University Rotterdam"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 focus:outline-none focus:border-[#102C57]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Country
                    </label>
                    <select
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 focus:outline-none focus:border-[#102C57]"
                    >
                      {countries.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {selectedUni
                  ? `Selected: ${selectedUni.name}`
                  : isCustomUni
                    ? `Custom: ${customUniName || "Enter name"}`
                    : "Select an institution to proceed"}
              </span>
              <button
                type="button"
                onClick={() => handleProceedToDetails()}
                disabled={
                  !selectedUni && (!isCustomUni || !customUniName.trim())
                }
                className="flex items-center gap-2 rounded-xl bg-[#102C57] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#EA5C2B]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Representative Info & Document Upload */}
        {step === "representative_info" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#102C57] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#EA5C2B]" />
                  Step 2: Official Representative Authorization
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Claiming listing for:{" "}
                  <strong className="text-slate-800">
                    {activeUniName} ({activeUniCountry})
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("select_university")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change University
              </button>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Representative Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Dr. Thomas Weber"
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 font-medium focus:border-[#102C57] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Designation / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Director of International Admissions / Dean"
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 font-medium focus:border-[#102C57] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="admissions@tum.de or representative@stanford.edu"
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 font-medium focus:border-[#102C57] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Must use official institutional domain (.edu, .ac.uk, .de,
                    .ca, etc.). Personal email providers (gmail/yahoo) are
                    rejected.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Direct Phone / Office Extension *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 89 289 01"
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 font-medium focus:border-[#102C57] focus:outline-none"
                  />
                </div>
              </div>

              {/* Document Upload & URL proof */}
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Authorization Proof (Official Document / Faculty Profile URL)
                  *
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center hover:border-slate-300 transition bg-slate-50/50">
                    <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                    <label className="mt-2 block cursor-pointer text-xs font-bold text-[#102C57] hover:underline">
                      <span>
                        {uploadedFileName
                          ? uploadedFileName
                          : "Upload Letter of Authorization / Staff ID (PDF/PNG)"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </div>

                  <div>
                    <input
                      type="url"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="Or enter Official Staff Directory URL (https://...)"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 font-medium focus:border-[#102C57] focus:outline-none h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement checkbox */}
              <div className="pt-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreementSigned}
                    onChange={(e) => setAgreementSigned(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#102C57] focus:ring-[#102C57]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I declare and confirm that I am an authorized representative
                    of <strong>{activeUniName}</strong> empowered to manage
                    course listings, student admissions inquiries, and
                    partnership terms on Abroadroute.
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep("select_university")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={
                    sendingOtp ||
                    !agreementSigned ||
                    !applicantName ||
                    !officialEmail
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#102C57] px-6 py-2.5 font-bold text-white hover:bg-[#0c2242] transition disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#EA5C2B]" />
                      <span>Verifying Domain & Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <MailCheck className="h-4 w-4 text-[#EA5C2B]" />
                      <span>Send 2FA Verification Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: OTP Verification */}
        {step === "verify_otp" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 max-w-xl mx-auto">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#102C57] mb-3">
                <KeyRound className="h-6 w-6 text-[#EA5C2B]" />
              </div>
              <h2 className="text-lg font-black text-[#102C57]">
                Institutional Two-Factor Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We sent a 6-digit security code to{" "}
                <strong className="text-slate-800">{officialEmail}</strong>.
              </p>
            </div>

            {/* Dev OTP Box */}
            {devOtp && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Verification Code Preview (Sandbox Mode)
                </span>
                <div className="mt-1 font-mono text-2xl font-black tracking-[0.4em] text-[#102C57]">
                  {devOtp}
                </div>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Enter this code below to authenticate official ownership.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
              <div>
                <label className="block text-center font-bold text-slate-700 mb-2">
                  Enter 6-Digit Institutional Security Code
                </label>
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
                  className="w-full rounded-2xl border-2 border-slate-200 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] text-[#102C57] focus:border-[#102C57] focus:outline-none transition"
                />
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {secondsLeft > 0
                      ? `Code expires in ${mmss}`
                      : "Code expired"}
                  </span>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={sendingOtp}
                    className="font-bold text-[#EA5C2B] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2">
                <Clock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upon OTP verification, your claim is submitted to the{" "}
                  <strong>Vista Institutional Partnerships Team</strong> with a
                  guaranteed <strong>3-Business-Day Review SLA</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep("representative_info")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={submittingClaim || otp.length !== 6}
                  className="flex items-center gap-2 rounded-xl bg-[#102C57] px-6 py-2.5 font-bold text-white hover:bg-[#0c2242] transition disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingClaim ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#EA5C2B]" />
                      <span>Authenticating Claim...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-[#EA5C2B]" />
                      <span>Submit Official Claim</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Confirmed Receipt */}
        {step === "confirmed" && claimSuccessData && (
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 shadow-md text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                Claim Verification Ticket Created
              </span>
              <h2 className="mt-3 text-2xl font-black text-[#102C57]">
                Claim Request Submitted Successfully
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ticket Reference:{" "}
                <strong className="font-mono text-slate-800">
                  {claimSuccessData.claimId}
                </strong>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-bold text-[#102C57]">
                  {claimSuccessData.universityName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Representative:</span>
                <span className="font-semibold text-slate-700">
                  {claimSuccessData.applicant}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {claimSuccessData.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Review SLA:</span>
                <span className="font-bold text-emerald-700">
                  3 Business Days (SLA Guaranteed)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted On:</span>
                <span className="text-slate-700">
                  {claimSuccessData.submittedAt}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/portal/university"
                className="w-full sm:w-auto rounded-xl bg-[#102C57] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition shadow-xs"
              >
                Access Partner Workspace Console →
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
