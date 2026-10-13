"use client";

import { useState } from "react";
import {
  Building2,
  X,
  Save,
  Loader2,
  Award,
  MapPin,
  Coins,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface EditUniversityProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    id?: string;
    name: string;
    city: string;
    country: string;
    rankingGlobal: number | string;
    rankingNational: number | string;
    tuitionFeeRangeINR: string;
    ieltsMinScore: number | string;
    acceptanceRate: number | string;
    postStudyWorkMonths: number | string;
  };
  onSave: (updated: any) => void;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export function EditUniversityProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditUniversityProfileModalProps) {
  const [name, setName] = useState(initialData.name || "");
  // Empty when the database has no value; nothing is pre-filled
  const [city, setCity] = useState(initialData.city ?? "");
  const [country, setCountry] = useState(initialData.country ?? "");
  const [rankingGlobal, setRankingGlobal] = useState(
    initialData.rankingGlobal ?? "",
  );
  const [rankingNational, setRankingNational] = useState(
    initialData.rankingNational ?? "",
  );
  const [tuitionFeeRangeINR, setTuitionFeeRangeINR] = useState(
    initialData.tuitionFeeRangeINR ?? "",
  );
  const [ieltsMinScore, setIeltsMinScore] = useState(
    initialData.ieltsMinScore ?? "",
  );
  const [acceptanceRate, setAcceptanceRate] = useState(
    initialData.acceptanceRate ?? "",
  );
  const [postStudyWorkMonths, setPostStudyWorkMonths] = useState(
    initialData.postStudyWorkMonths ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !city.trim()) {
      setErrorMsg("University name and city are required.");
      return;
    }

    setSaving(true);

    const updatedObj = {
      ...initialData,
      name: name.trim(),
      city: city.trim(),
      country: country.trim(),
      // Blank fields stay null (the API leaves them unchanged)
      rankingGlobal: numberOrNull(rankingGlobal),
      rankingNational: numberOrNull(rankingNational),
      tuitionFeeRangeINR: String(tuitionFeeRangeINR).trim() || null,
      ieltsMinScore: numberOrNull(ieltsMinScore),
      acceptanceRate: numberOrNull(acceptanceRate),
      postStudyWorkMonths: numberOrNull(postStudyWorkMonths),
    };

    try {
      // 1. Persist to Supabase via server API route
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const res = await fetch("/api/universities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: updatedObj.name,
          slug: (initialData.id || updatedObj.name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          // City and country are locked here: never sent, so the stored
          // city id (cities.id) is not overwritten with a display name
          ranking_global: updatedObj.rankingGlobal,
          ranking_national: updatedObj.rankingNational,
          tuition_fee_range_inr: updatedObj.tuitionFeeRangeINR,
          ielts_min_score: updatedObj.ieltsMinScore,
          acceptance_rate: updatedObj.acceptanceRate,
          post_study_work_months: updatedObj.postStudyWorkMonths,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save university profile.");
      }

      onSave(updatedObj);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.warn("University profile update error:", err);
      setErrorMsg(err?.message || "Failed to save university profile.");
    } finally {
      setSaving(false);
    }
  };

  // After all hooks so their order never changes between renders
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#102C57]">
              <Building2 className="h-5 w-5 text-[#EA5C2B]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#102C57]">
                Edit University Profile
              </h2>
              <p className="text-xs text-slate-500">
                Update official institutional details & criteria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3 text-red-700 font-bold border border-red-200">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-800 font-bold border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>
                University profile updated successfully! Syncing live...
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  University Name
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  <Lock className="h-2.5 w-2.5" /> Locked
                </span>
              </div>
              <input
                type="text"
                value={name}
                disabled
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs text-slate-500 font-semibold cursor-not-allowed select-none outline-none"
                placeholder="e.g. Technical University of Munich"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Institutional name is verified and cannot be edited.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  City & Location
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  <Lock className="h-2.5 w-2.5" /> Locked
                </span>
              </div>
              <input
                type="text"
                value={city ? `${city}${country ? `, ${country}` : ""}` : ""}
                disabled
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs text-slate-500 font-semibold cursor-not-allowed select-none outline-none"
                placeholder="e.g. Munich, Germany"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Official campus location locked by accreditation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                QS Global Rank
              </label>
              <input
                type="number"
                value={rankingGlobal}
                onChange={(e) => setRankingGlobal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-[#102C57] focus:ring-1 focus:ring-[#102C57] outline-none"
                placeholder="28"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                National Rank
              </label>
              <input
                type="number"
                value={rankingNational}
                onChange={(e) => setRankingNational(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-[#102C57] focus:ring-1 focus:ring-[#102C57] outline-none"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Min. IELTS Band
              </label>
              <input
                type="text"
                value={ieltsMinScore}
                onChange={(e) => setIeltsMinScore(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-[#102C57] focus:ring-1 focus:ring-[#102C57] outline-none"
                placeholder="6.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tuition Fee Range
              </label>
              <input
                type="text"
                value={tuitionFeeRangeINR}
                onChange={(e) => setTuitionFeeRangeINR(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-[#102C57] focus:ring-1 focus:ring-[#102C57] outline-none"
                placeholder="€0 (Public University) or ₹15-25L/yr"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Acceptance Rate %
              </label>
              <input
                type="text"
                value={acceptanceRate}
                onChange={(e) => setAcceptanceRate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-[#102C57] focus:ring-1 focus:ring-[#102C57] outline-none"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                PSW Visa (Months)
              </label>
              <input
                type="text"
                value={postStudyWorkMonths}
                onChange={(e) => setPostStudyWorkMonths(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-semibold focus:border-[#102C57] focus:ring-1 focus:ring-[#102C57] outline-none"
                placeholder="18"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-5 py-2 font-bold text-white hover:bg-[#0c2242] transition cursor-pointer shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#EA5C2B]" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-[#EA5C2B]" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
