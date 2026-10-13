"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

interface UniversityInquiryFormProps {
  universityId: string; // links the lead to this university's portal
  universityName: string;
  countrySlug: string;
  // Programs this university offers; the student picks one
  programs: { id: string; name: string }[];
}

export function UniversityInquiryForm({
  universityId,
  universityName,
  countrySlug,
  programs,
}: UniversityInquiryFormProps) {
  const [programTarget, setProgramTarget] = useState(programs[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!phone.replace(/\D/g, "").match(/^[6-9]\d{9}$/)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          countryTarget: countrySlug || undefined,
          programTarget,
          universityId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      // Save to client storage
      try {
        const localLead = {
          id: `live-${Date.now()}`,
          fullName,
          email,
          phone,
          countryTarget: countrySlug,
          programTarget,
          createdAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem("vista_submitted_leads") || "[]");
        localStorage.setItem("vista_submitted_leads", JSON.stringify([localLead, ...existing]));
        window.dispatchEvent(new CustomEvent("vista_lead_submitted"));
      } catch {
        // ignore
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/70 p-6 text-center shadow-md">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-2 text-base font-serif font-bold text-[#103B47]">Eligibility Review Requested!</h3>
        <p className="mt-1 text-xs text-slate-600">
          Thank you, <strong className="text-slate-900">{fullName}</strong>. An admissions counselor for {universityName} will contact you via WhatsApp/Phone within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D9CFB8]/80 bg-white p-6 shadow-sm sticky top-24">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2 w-2 rounded-full bg-[#D89A3E]" />
        <h3 className="text-base font-serif font-bold text-[#103B47]">Free Admission Review</h3>
      </div>
      <p className="text-xs text-slate-500">Check your admission eligibility for {universityName}.</p>
      
      {errorMsg && (
        <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#103B47] focus:ring-1 focus:ring-[#103B47] focus:outline-none bg-[#FDFCF7]/50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#103B47] focus:ring-1 focus:ring-[#103B47] focus:outline-none bg-[#FDFCF7]/50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number (+91)</label>
          <input
            type="tel"
            required
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#103B47] focus:ring-1 focus:ring-[#103B47] focus:outline-none bg-[#FDFCF7]/50 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Program</label>
          <select
            required
            value={programTarget}
            onChange={(e) => setProgramTarget(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#103B47] focus:ring-1 focus:ring-[#103B47] focus:outline-none bg-[#FDFCF7]/50"
          >
            {programs.length === 0 && <option value="">No programs listed</option>}
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !programTarget}
          className="w-full min-h-[44px] rounded-xl bg-[#103B47] py-2.5 px-4 text-xs sm:text-sm font-bold text-white transition hover:bg-[#1D5A6C] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <span>Submit for Eligibility Check</span>
              <ArrowRight className="h-4 w-4 text-[#D89A3E]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
