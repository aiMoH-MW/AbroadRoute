"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  ShieldCheck,
  Building2,
  Globe2,
  BookOpen,
  Users,
  Lock,
  LogOut,
  Loader2,
  AlertOctagon,
  LayoutDashboard,
  Zap,
  Sparkles,
  Library,
  SlidersHorizontal,
  CalendarClock,
  Banknote,
  Award,
  FileText,
  Briefcase,
} from "lucide-react";
import { Country, University, Program } from "@/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase, getAuthHeaders } from "@/lib/supabase/client";
import {
  fetchLiveCountries,
  fetchLiveUniversities,
  fetchLivePrograms,
  fetchLiveClaims,
} from "@/lib/supabase/dataFetchers";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { EditUniversityModal } from "@/components/admin/EditUniversityModal";
import { AdminOverviewTab } from "@/components/admin/AdminOverviewTab";
import { AdminClaimsTab } from "@/components/admin/AdminClaimsTab";
import { AdminUniversitiesTab } from "@/components/admin/AdminUniversitiesTab";
import { AdminCountriesTab } from "@/components/admin/AdminCountriesTab";
import { AdminProgramsTab } from "@/components/admin/AdminProgramsTab";
import { AdminDeadlinesTab } from "@/components/admin/AdminDeadlinesTab";
import { AdminLoanLendersTab } from "@/components/admin/AdminLoanLendersTab";
import { AdminScholarshipsTab } from "@/components/admin/AdminScholarshipsTab";
import { AdminLeadsTab } from "@/components/admin/AdminLeadsTab";
import { AdminSiteContentTab } from "@/components/admin/AdminSiteContentTab";
import { AdminBuyersTab } from "@/components/admin/AdminBuyersTab";
import { AdminAICounsellorKBTab } from "@/components/admin/AdminAICounsellorKBTab";
import { AdminStudyDataTab } from "@/components/admin/AdminStudyDataTab";
import { AdminTestModuleTab, type TestModuleSection } from "@/components/admin/AdminTestModuleTab";

type AdminTab =
  | "overview"
  | "claims"
  | "universities"
  | "countries"
  | "programs"
  | "deadlines"
  | "loan-lenders"
  | "scholarships"
  | "site-content"
  | "buyers"
  | "leads"
  | "kb"
  | "study-data"
  | "test-settings";

function AdminPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [testModuleSection, setTestModuleSection] = useState<TestModuleSection>("settings");
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [universitiesList, setUniversitiesList] = useState<University[]>([]);
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [claimsList, setClaimsList] = useState<any[]>([]);

  const [selectedUniToEdit, setSelectedUniToEdit] = useState<University | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isRefreshingClaims, setIsRefreshingClaims] = useState(false);
  // Admin access is verified against the Supabase session's server-controlled
  // app_metadata, never the cached client-side role.
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsVerifiedAdmin(null);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setIsVerifiedAdmin(session?.user?.app_metadata?.role === "admin");
        }
      })
      .catch(() => {
        if (!cancelled) setIsVerifiedAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Sync tab from URL query params if provided
  useEffect(() => {
    const tabParam = searchParams.get("tab") as AdminTab;
    // Q&A Extraction now lives inside Test Module Settings; keep old links working.
    if ((tabParam as string) === "qa-extraction" || searchParams.get("section") === "qa") {
      setActiveTab("test-settings");
      setTestModuleSection("qa");
      return;
    }
    if (
      tabParam &&
      [
        "overview",
        "claims",
        "universities",
        "countries",
        "programs",
        "deadlines",
        "loan-lenders",
        "scholarships",
        "site-content",
        "buyers",
        "leads",
        "kb",
        "study-data",
        "test-settings",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    // Update URL shallowly
    window.history.replaceState(null, "", `/admin?tab=${tab}`);
  };

  const handleApproveClaim = async (claim: any) => {
    const res = await fetch("/api/claims/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({
        claimId: claim.id,
        action: "approved",
        universityId: claim.universityId || claim.universitySlug,
        universityName: claim.universityName,
        userId: claim.userId,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Failed to approve claim.");
    }

    setClaimsList((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, status: "approved" } : c)),
    );
  };

  const refreshClaims = async () => {
    setIsRefreshingClaims(true);
    try {
      const claims = await fetchLiveClaims();
      setClaimsList(claims);
    } finally {
      setIsRefreshingClaims(false);
    }
  };

  const refreshUniversities = async () => {
    const res = await fetchLiveUniversities();
    setUniversitiesList(res);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        router.push("/login?redirect=/admin");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && isVerifiedAdmin) {
      fetchLiveCountries().then((res) => setCountriesList(res));
      fetchLiveUniversities().then((res) => setUniversitiesList(res));
      fetchLivePrograms().then((res) => setProgramsList(res));
      fetchLiveClaims().then((res) => setClaimsList(res));
      refreshClaims();

      const pollInterval = setInterval(() => {
        fetchLiveClaims().then((res) => setClaimsList(res));
      }, 8000);

      return () => clearInterval(pollInterval);
    }
  }, [user, isVerifiedAdmin]);

  // 1. Loading State during session hydration / admin verification
  if (isLoading || (user && isVerifiedAdmin === null)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mb-4 border border-white/10 animate-pulse">
          <Compass className="h-7 w-7 text-[#EA5C2B]" />
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin text-[#EA5C2B]" />
          <span>Verifying Administrator Security Clearance...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white selection:bg-[#EA5C2B]/30">
        <div className="w-full max-w-md rounded-3xl border border-red-900/40 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/80 border border-red-800/60 text-red-400 mb-5 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <span className="rounded-full bg-red-900/40 border border-red-700/50 px-3 py-1 text-[11px] font-bold text-red-300 uppercase tracking-widest">
            Protected Admin Zone
          </span>

          <h1 className="mt-3 text-2xl font-black text-white">
            Authentication Required
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            The Abroadroute Operations & Lead Distribution Engine is restricted
            to authorized platform administrators only.
          </p>

          <div className="mt-6 flex flex-col gap-3">

            <Link
              href="/login?redirect=/admin"
              className="rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-center"
            >
              Sign In with Credentials →
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-slate-800/50 bg-slate-950 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-300 text-center"
            >
              ← Return to Public Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but Unauthorized Role
  if (!isVerifiedAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white selection:bg-[#EA5C2B]/30">
        <div className="w-full max-w-md rounded-3xl border border-amber-900/40 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-950/80 border border-amber-800/60 text-amber-400 mb-5 shadow-inner">
            <AlertOctagon className="h-8 w-8" />
          </div>

          <span className="rounded-full bg-amber-900/40 border border-amber-700/50 px-3 py-1 text-[11px] font-bold text-amber-300 uppercase tracking-widest">
            403 Forbidden · Access Denied
          </span>

          <h1 className="mt-3 text-2xl font-black text-white">
            Super Admin Access Required
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            You are signed in as{" "}
            <strong className="text-white">{user.email}</strong> (Role:{" "}
            <span className="text-amber-400 font-bold uppercase">
              {user.role}
            </span>
            ). This account does not possess Super Administrator permissions.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={
                user.role === "buyer"
                  ? "/portal/buyer"
                  : user.role === "university"
                    ? "/portal/university"
                    : "/dashboard/student"
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              {user.role === "buyer"
                ? "Go to Buyer Portal"
                : user.role === "university"
                  ? "Go to University Portal"
                  : "Go to My Dashboard"}
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/login?redirect=/admin");
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Current Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingClaimsCount = claimsList.filter(
    (c) => c.status === "pending",
  ).length;

  const tabsConfig = [
    {
      id: "overview" as AdminTab,
      label: "Overview & KPIs",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "claims" as AdminTab,
      label: "Profile Claims",
      icon: ShieldCheck,
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : null,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      id: "universities" as AdminTab,
      label: "Universities",
      icon: Building2,
      badge: universitiesList.length || null,
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      id: "countries" as AdminTab,
      label: "Destinations",
      icon: Globe2,
      badge: countriesList.length || null,
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      id: "programs" as AdminTab,
      label: "Programs & Streams",
      icon: BookOpen,
      badge: programsList.length || null,
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      id: "deadlines" as AdminTab,
      label: "Deadlines",
      icon: CalendarClock,
      badge: null,
    },
    {
      id: "loan-lenders" as AdminTab,
      label: "Loan Lenders",
      icon: Banknote,
      badge: null,
    },
    {
      id: "scholarships" as AdminTab,
      label: "Scholarships",
      icon: Award,
      badge: null,
    },
    {
      id: "site-content" as AdminTab,
      label: "Site Content",
      icon: FileText,
      badge: null,
    },
    {
      id: "buyers" as AdminTab,
      label: "B2B Buyers & Wallets",
      icon: Briefcase,
      badge: null,
    },
    {
      id: "leads" as AdminTab,
      label: "Lead Engine (LDE)",
      icon: Users,
      badge: null,
    },
    {
      id: "kb" as AdminTab,
      label: "AI Counsellor KB",
      icon: Sparkles,
      badge: null,
    },
    {
      id: "study-data" as AdminTab,
      label: "Study Data",
      icon: Library,
      badge: null,
    },
    {
      id: "test-settings" as AdminTab,
      label: "Test Module Settings",
      icon: SlidersHorizontal,
      badge: null,
    },
  ];

  // 4. Authorized Super Administrator -> Render Operations Control Center with Component Tabs
  return (
    <div className="min-h-screen bg-slate-100 selection:bg-[#EA5C2B]/30 pb-16">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900 px-4 py-3.5 sm:px-6 lg:px-8 text-white sticky top-0 z-30 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="wordmark" theme="dark" size="md" />
            <span className="hidden sm:inline-block rounded-md bg-red-900/60 px-2.5 py-1 text-[11px] font-bold text-red-300 border border-red-700/50">
              Admin Operations Center
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-semibold">
                {user.name || "Super Admin"}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Platform Administration & Operations
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Dnyanal Educon Pvt. Ltd. • Multi-tenant management, claims
              authorization, and catalog infrastructure.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#102C57] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-[#EA5C2B]" : "text-slate-400"}`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`ml-0.5 rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : tab.badgeColor || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="mt-2">
          {activeTab === "overview" && (
            <AdminOverviewTab
              countriesCount={countriesList.length}
              universitiesCount={universitiesList.length}
              programsCount={programsList.length}
              pendingClaimsCount={pendingClaimsCount}
              onNavigateTab={(tabId) => handleTabChange(tabId as AdminTab)}
              claimsList={claimsList}
            />
          )}

          {activeTab === "claims" && (
            <AdminClaimsTab
              claimsList={claimsList}
              onApproveClaim={handleApproveClaim}
              onRefreshClaims={refreshClaims}
              isRefreshing={isRefreshingClaims}
            />
          )}

          {activeTab === "universities" && (
            <AdminUniversitiesTab
              universitiesList={universitiesList}
              countriesList={countriesList}
              onEditUniversity={(uni) => {
                setSelectedUniToEdit(uni);
                setIsEditModalOpen(true);
              }}
              onRefreshUniversities={refreshUniversities}
            />
          )}

          {activeTab === "countries" && (
            <AdminCountriesTab
              countriesList={countriesList}
              universitiesList={universitiesList}
            />
          )}

          {activeTab === "programs" && (
            <AdminProgramsTab programsList={programsList} />
          )}

          {activeTab === "deadlines" && (
            <AdminDeadlinesTab
              countriesList={countriesList}
              universitiesList={universitiesList}
              programsList={programsList}
            />
          )}

          {activeTab === "loan-lenders" && <AdminLoanLendersTab />}

          {activeTab === "scholarships" && (
            <AdminScholarshipsTab
              countriesList={countriesList}
              universitiesList={universitiesList}
            />
          )}

          {activeTab === "site-content" && (
            <AdminSiteContentTab
              countriesList={countriesList}
              programsList={programsList}
            />
          )}

          {activeTab === "buyers" && <AdminBuyersTab />}

          {activeTab === "leads" && <AdminLeadsTab programsList={programsList} />}

          {activeTab === "kb" && <AdminAICounsellorKBTab />}

          {activeTab === "study-data" && <AdminStudyDataTab programsList={programsList} />}


          {activeTab === "test-settings" && (
            <AdminTestModuleTab programsList={programsList} initialSection={testModuleSection} />
          )}
        </div>
      </div>

      {/* Edit University Modal */}
      <EditUniversityModal
        university={selectedUniToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUniToEdit(null);
        }}
        onSave={(updatedUni) => {
          setUniversitiesList((prev) =>
            prev.map((item) =>
              item.slug === updatedUni.slug ? updatedUni : item,
            ),
          );
        }}
      />
    </div>
  );
}

export default function AdminPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mb-4 border border-white/10 animate-pulse">
            <Compass className="h-7 w-7 text-[#EA5C2B]" />
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-[#EA5C2B]" />
            <span>Loading Administrator Operations Center...</span>
          </div>
        </div>
      }
    >
      <AdminPortalContent />
    </Suspense>
  );
}
