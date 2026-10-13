"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Bot, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

import { AICounsellorDrawer } from "@/components/ai/AICounsellorDrawer";
import { LeadModal } from "@/components/lead/LeadModal";
import { SearchDialog } from "@/components/search/SearchDialog";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";

interface AuthModalConfig {
  title?: string;
  description?: string;
}

interface HomeModalsContextType {
  openSearch: () => void;
  openAICounsellor: (initialQuery?: string) => void;
  openLeadModal: (countryOrProgram?: string) => void;
  openAuthModal: (config?: AuthModalConfig) => void;
  setDoNotDisturb: (dnd: boolean) => void;
}

const HomeModalsContext = createContext<HomeModalsContextType | null>(null);

export function useHomeModals() {
  const ctx = useContext(HomeModalsContext);
  if (!ctx) {
    return {
      openSearch: () => {},
      openAICounsellor: (_query?: string) => {},
      openLeadModal: () => {},
      openAuthModal: () => {},
      setDoNotDisturb: (_dnd: boolean) => {},
    };
  }
  return ctx;
}

export function HomeModalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStudioOrAdmin = Boolean(
    pathname?.startsWith("/studio") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal"),
  );
  const { isLoggedIn } = useAuth();
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<
    AuthModalConfig | undefined
  >();
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const openAICounsellor = (initialQuery?: string) => {
    if (initialQuery) {
      setAiInitialQuery(initialQuery);
    }
    setAiDrawerOpen(true);
  };

  const openLeadModal = (countryOrProgram?: unknown) => {
    if (typeof countryOrProgram === "string") {
      setSelectedCountryName(countryOrProgram);
    } else {
      setSelectedCountryName("");
    }
    setLeadModalOpen(true);
  };

  const openSearch = () => setSearchDialogOpen(true);
  const openAuthModal = (config?: AuthModalConfig) => {
    setAuthModalConfig(config);
    setAuthModalOpen(true);
  };

  // [FR-AI-001] Do-not-disturb active during open modals / form submission
  const isDNDActive =
    doNotDisturb || leadModalOpen || authModalOpen || searchDialogOpen;

  return (
    <HomeModalsContext.Provider
      value={{
        openSearch,
        openAICounsellor,
        openLeadModal,
        openAuthModal,
        setDoNotDisturb,
      }}
    >
      {children}

      {/* Sticky Mobile CTA Bar - Hidden on /studio, /admin, /portal */}
      {!isStudioOrAdmin && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#D9CFB8] bg-[#FDFCF7]/95 p-3 backdrop-blur-md shadow-lg sm:hidden">
          <button
            onClick={() => openLeadModal()}
            className="w-full min-h-[44px] rounded-xl bg-[#D89A3E] py-3 text-center text-xs font-bold text-[#103B47] shadow-md transition hover:bg-[#EBC783] active:scale-98 cursor-pointer"
          >
            Get Free Counselling →
          </button>
        </div>
      )}

      {/* [FR-AI-001] Floating Route AI Counsellor Button: Bottom-Right (positioned above mobile sticky bar) */}
      {!isStudioOrAdmin && !isDNDActive && (
        <div className="fixed bottom-[72px] right-4 sm:bottom-[24px] sm:right-[24px] z-40">
          <button
            onClick={() => openAICounsellor()}
            aria-label="Talk to Route AI counsellor"
            className="group flex min-h-[44px] min-w-[44px] items-center gap-2.5 rounded-full bg-gradient-to-r from-[#103B47] to-[#1D5A6C] border border-[#7C6BAE]/40 p-2.5 sm:px-4 sm:py-2.5 text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:border-[#D89A3E] active:scale-95 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C6BAE]/25 text-[#D89A3E] font-bold text-sm shadow-inner">
              ✦
            </div>
            <span className="pr-1 text-[11px] font-sans font-medium uppercase tracking-[0.2em] hidden sm:inline-flex items-center gap-1.5 text-[#FDFCF7]">
              Route AI Counsellor
              {!isLoggedIn && <Lock className="h-3 w-3 text-[#D89A3E]" />}
            </span>
            <span className="relative flex h-2.5 w-2.5 sm:hidden">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D89A3E] opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#D89A3E]"></span>
            </span>
          </button>
        </div>
      )}

      {/* Slide-over AI Counsellor Drawer */}
      {aiDrawerOpen && (
        <AICounsellorDrawer
          isOpen={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
          onOpenLeadModal={() => openLeadModal(selectedCountryName)}
          onOpenAuthModal={() => openAuthModal()}
          initialQuery={aiInitialQuery}
        />
      )}

      {/* Auth Required Modal */}
      {authModalOpen && (
        <AuthRequiredModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          title={authModalConfig?.title}
          description={authModalConfig?.description}
        />
      )}

      {/* Search Modal */}
      {searchDialogOpen && (
        <SearchDialog
          isOpen={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
        />
      )}

      {/* Lead Capture Modal */}
      {leadModalOpen && (
        <LeadModal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
          defaultCountry={selectedCountryName}
        />
      )}
    </HomeModalsContext.Provider>
  );
}

export function LeadTriggerButton({
  children,
  country,
  className,
}: {
  children: ReactNode;
  country?: string;
  className?: string;
}) {
  const { openLeadModal } = useHomeModals();
  return (
    <button onClick={() => openLeadModal(country)} className={className}>
      {children}
    </button>
  );
}

export function AICounsellorTriggerButton({
  children,
  initialQuery,
  className,
}: {
  children: ReactNode;
  initialQuery?: string;
  className?: string;
}) {
  const { openAICounsellor } = useHomeModals();
  return (
    <button
      onClick={() => openAICounsellor(initialQuery)}
      className={className}
    >
      {children}
    </button>
  );
}
