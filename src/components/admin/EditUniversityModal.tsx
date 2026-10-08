"use client";

import { useEffect, useState } from "react";
import { X, Save, Building2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Program, ProgramCategory, University, UniversityProgram } from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";
import { fetchLivePrograms } from "@/lib/supabase/dataFetchers";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Form state for one offered program; fee kept as text while editing
interface ProgramRow {
  programId: string;
  yearlyTuitionINR: string;
  duration: string;
}

function initialProgramRows(university: University): ProgramRow[] {
  if (university.programs && university.programs.length > 0) {
    return university.programs.map((p) => ({
      programId: p.programId,
      yearlyTuitionINR: p.yearlyTuitionINR === null ? "" : String(p.yearlyTuitionINR),
      duration: p.duration || "",
    }));
  }
  return (university.programsOffered || []).map((programId) => ({
    programId,
    yearlyTuitionINR: "",
    duration: "",
  }));
}

interface Props {
  university: University | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUni: University) => void;
}

export function EditUniversityModal({ university, isOpen, onClose, onSave }: Props) {
  if (!isOpen || !university) return null;
  // Keyed so the form resets for each university
  return (
    <EditUniversityForm
      key={university.slug}
      university={university}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function EditUniversityForm({
  university,
  onClose,
  onSave,
}: Omit<Props, "isOpen" | "university"> & { university: University }) {
  const [formData, setFormData] = useState<University>({ ...university });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [programRows, setProgramRows] = useState<ProgramRow[]>(() =>
    initialProgramRows(university),
  );
  // Program assignments are stored against the Supabase row id
  const canAssignPrograms = UUID_PATTERN.test(university.id);

  useEffect(() => {
    fetchLivePrograms().then(setAllPrograms);
  }, []);

  const toggleProgram = (programId: string, checked: boolean) => {
    setProgramRows((rows) =>
      checked
        ? [...rows, { programId, yearlyTuitionINR: "", duration: "" }]
        : rows.filter((r) => r.programId !== programId),
    );
  };

  const updateProgramRow = (
    programId: string,
    field: "yearlyTuitionINR" | "duration",
    value: string,
  ) => {
    setProgramRows((rows) =>
      rows.map((r) => (r.programId === programId ? { ...r, [field]: value } : r)),
    );
  };

  // Saves program assignments; returns them, or throws with a readable message
  const saveProgramAssignments = async (): Promise<UniversityProgram[]> => {
    const programs: UniversityProgram[] = programRows.map((r) => ({
      programId: r.programId,
      yearlyTuitionINR:
        r.yearlyTuitionINR.trim() === "" ? null : Math.round(Number(r.yearlyTuitionINR)),
      duration: r.duration.trim() || null,
    }));
    const invalid = programs.find(
      (p) =>
        p.yearlyTuitionINR !== null &&
        (Number.isNaN(p.yearlyTuitionINR) || p.yearlyTuitionINR < 0),
    );
    if (invalid) {
      throw new Error(
        `Yearly fee for ${invalid.programId.toUpperCase()} must be a positive number`,
      );
    }

    const res = await fetch("/api/admin/university-programs", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
      body: JSON.stringify({ universityId: university.id, programs }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to save programs");
    }
    return programs;
  };

  const handleChange = (field: keyof University, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // 1. University fields, via the admin API. Empty fields are left
      // unchanged; nothing is filled in.
      const res = await fetch("/api/universities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          slug: formData.slug,
          name: formData.name,
          city: formData.city,
          country: formData.country,
          ranking_global: formData.rankingGlobal,
          tuition_fee_range_inr: formData.tuitionFeeRangeINR,
          ielts_min_score: formData.ieltsMinScore,
          acceptance_rate: formData.acceptanceRate,
          post_study_work_months: formData.postStudyWorkMonths,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Failed to save university");
        return;
      }

      // 2. Program assignments (surface errors and keep the modal open)
      let updated = formData;
      if (canAssignPrograms) {
        try {
          const programs = await saveProgramAssignments();
          updated = {
            ...formData,
            programs,
            programsOffered: programs.map((p) => p.programId as ProgramCategory),
          };
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to save programs");
          return;
        }
      }

      onSave(updated);
      setSuccessMessage("University saved to the database.");

      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save university");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#102C57]">
              <Building2 className="h-5 w-5 text-[#EA5C2B]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#102C57]">Edit University Details</h2>
              <p className="text-[11px] text-slate-500">Changes are saved to the database. Empty fields are left unchanged.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notices */}
        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">University Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-semibold focus:border-[#102C57] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-medium focus:border-[#102C57] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-medium focus:border-[#102C57] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">QS Global Rank</label>
              <input
                type="number"
                value={formData.rankingGlobal || ""}
                onChange={(e) =>
                  handleChange(
                    "rankingGlobal",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-medium focus:border-[#102C57] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tuition Fee Range (INR)</label>
              <input
                type="text"
                value={formData.tuitionFeeRangeINR || ""}
                onChange={(e) => handleChange("tuitionFeeRangeINR", e.target.value)}
                placeholder="e.g. ₹15 - 30 Lakhs / yr"
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-medium focus:border-[#102C57] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min IELTS Score</label>
              <input
                type="number"
                step="0.5"
                value={formData.ieltsMinScore || ""}
                onChange={(e) =>
                  handleChange(
                    "ieltsMinScore",
                    e.target.value === "" ? undefined : parseFloat(e.target.value),
                  )
                }
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-medium focus:border-[#102C57] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Acceptance Rate %</label>
              <input
                type="number"
                value={formData.acceptanceRate || ""}
                onChange={(e) =>
                  handleChange(
                    "acceptanceRate",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-medium focus:border-[#102C57] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Work Visa (Months)</label>
              <input
                type="number"
                value={formData.postStudyWorkMonths || ""}
                onChange={(e) =>
                  handleChange(
                    "postStudyWorkMonths",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-900 font-medium focus:border-[#102C57] focus:outline-none"
              />
            </div>
          </div>

          {/* Programs Offered */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block font-bold text-slate-700">Programs Offered</label>
            <p className="mt-0.5 mb-2 text-[11px] text-slate-500">
              Leave fee or duration empty to use the program&apos;s default.
            </p>
            {!canAssignPrograms ? (
              <p className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[11px] font-semibold text-amber-800">
                This university is not in the database yet, so programs cannot be assigned.
              </p>
            ) : allPrograms.length === 0 ? (
              <p className="text-[11px] text-slate-500">Loading programs…</p>
            ) : (
              <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {allPrograms.map((program) => {
                  const row = programRows.find((r) => r.programId === program.slug);
                  return (
                    <div
                      key={program.id}
                      className={`rounded-xl border p-2.5 ${
                        row ? "border-[#102C57]/30 bg-indigo-50/40" : "border-slate-200"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={!!row}
                          onChange={(e) => toggleProgram(program.slug, e.target.checked)}
                          className="h-3.5 w-3.5 accent-[#102C57]"
                        />
                        <span>{program.name}</span>
                      </label>
                      {row && (
                        <div className="mt-2 grid grid-cols-2 gap-2 pl-5">
                          <input
                            type="number"
                            min={0}
                            value={row.yearlyTuitionINR}
                            onChange={(e) =>
                              updateProgramRow(program.slug, "yearlyTuitionINR", e.target.value)
                            }
                            placeholder={
                              program.yearlyEducationalCost
                                ? `Yearly fee ₹ (default ${program.yearlyEducationalCost})`
                                : "Yearly fee ₹ (e.g. 1500000)"
                            }
                            aria-label={`${program.name} yearly fee in INR`}
                            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-slate-900 focus:border-[#102C57] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={row.duration}
                            onChange={(e) =>
                              updateProgramRow(program.slug, "duration", e.target.value)
                            }
                            placeholder={`Duration (default ${program.duration})`}
                            aria-label={`${program.name} duration`}
                            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-slate-900 focus:border-[#102C57] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-5 py-2 font-bold text-white hover:bg-[#0c2242] transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#EA5C2B]" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-[#EA5C2B]" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
