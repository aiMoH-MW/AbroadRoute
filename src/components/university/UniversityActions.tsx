"use client";

import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  ArrowRight,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { ClaimProfileModal } from "@/components/university/ClaimProfileModal";
import {
  addToShortlist,
  removeFromShortlist,
  isUniversityShortlisted,
} from "@/lib/cookies/shortlist";

interface UniversityActionsProps {
  universityId?: string;
  universitySlug: string;
  universityName: string;
  countrySlug: string;
  claimedStatus?: string;
}

export function UniversityActions({
  universityId,
  universitySlug,
  universityName,
  countrySlug,
  claimedStatus = "unclaimed",
}: UniversityActionsProps) {
  const { openLeadModal, openAuthModal } = useHomeModals();
  const { user, isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [currentClaimStatus, setCurrentClaimStatus] = useState(claimedStatus);

  useEffect(() => {
    setMounted(true);
    setIsShortlisted(isUniversityShortlisted(universitySlug, user));

    const handleUpdate = () => {
      setIsShortlisted(isUniversityShortlisted(universitySlug, user));
    };

    window.addEventListener("vista_shortlist_updated", handleUpdate);
    return () => {
      window.removeEventListener("vista_shortlist_updated", handleUpdate);
    };
  }, [universitySlug, user]);

  const toggleShortlist = () => {
    try {
      if (isUniversityShortlisted(universitySlug, user)) {
        removeFromShortlist(universitySlug, user);
        setIsShortlisted(false);
        setShowSyncPrompt(false);
      } else {
        addToShortlist(universitySlug, user);
        setIsShortlisted(true);

        // Show sync prompt if student is in guest mode (not logged in)
        if (!isLoggedIn) {
          setShowSyncPrompt(true);
        }
      }
    } catch (e) {
      console.warn("Shortlist toggle error:", e);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {currentClaimStatus === "verified" ? (
          <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Verified Institution
          </span>
        ) : !isLoggedIn ? (
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D9CFB8] bg-white px-3.5 py-2 text-xs font-bold text-[#103B47] transition hover:bg-[#FDFCF7] hover:border-[#103B47] cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="h-4 w-4 text-[#D89A3E]" />
            <span>Claim Profile</span>
          </button>
        ) : null}

        <button
          onClick={toggleShortlist}
          className={`flex min-h-[44px] items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
            isShortlisted
              ? "border-[#D89A3E] bg-[#D89A3E]/10 text-[#D89A3E]"
              : "border-[#D9CFB8] bg-white text-slate-700 hover:bg-[#FDFCF7] hover:border-slate-300"
          }`}
        >
          <Star
            className={`h-4 w-4 ${isShortlisted ? "fill-[#D89A3E] text-[#D89A3E]" : "text-slate-400"}`}
          />
          <span>{isShortlisted ? "Shortlisted ✓" : "★ Shortlist"}</span>
        </button>

        <button
          onClick={() => openLeadModal(countrySlug)}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#D89A3E] px-5 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-[#c4872f] active:scale-98 cursor-pointer"
        >
          <span>Apply via AbroadRoute</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {showSyncPrompt && !isLoggedIn && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#D89A3E]/40 bg-[#D89A3E]/10 p-2.5 text-xs text-[#103B47] shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-[#D89A3E] shrink-0" />
            <span className="text-[11px] font-medium">
              Saved to guest session! Sign in to sync across devices & track
              application deadlines.
            </span>
          </div>
          <button
            onClick={() =>
              openAuthModal({
                title: "Save Shortlist to Your Profile",
                description:
                  "Create a free student account or sign in to permanently save your shortlisted universities, sync across all your devices, and track application deadlines.",
              })
            }
            className="shrink-0 rounded-lg bg-[#103B47] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1D5A6C] transition cursor-pointer"
          >
            Save to Profile →
          </button>
        </div>
      )}

      {/* Claim Profile Interactive Modal */}
      <ClaimProfileModal
        universityId={universityId || universitySlug}
        universityName={universityName}
        countrySlug={countrySlug}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSubmitted={() => setCurrentClaimStatus("pending")}
      />
    </div>
  );
}
