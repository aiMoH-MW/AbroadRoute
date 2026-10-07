"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Building2,
  BookOpen,
  GraduationCap,
  Compass,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  Trash2,
  Loader2,
  FileText,
  Calculator,
  Bot,
} from "lucide-react";
import { SearchResultItem } from "@/app/api/search/route";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry?: (slug: string) => void;
}

type CategoryTab =
  | "all"
  | "universities"
  | "courses"
  | "programs"
  | "destinations"
  | "guides"
  | "tools"
  | "test_prep";

const POPULAR_SUGGESTIONS = [
  {
    label: "Germany Free Tuition",
    query: "germany",
    tag: "Destination",
    countryCode: "de",
  },
  {
    label: "USA STEM Masters",
    query: "stem",
    tag: "Discipline",
    countryCode: "us",
  },
  { label: "TUM Munich", query: "tum", tag: "University", countryCode: "de" },
  {
    label: "Oxford Computer Science",
    query: "oxford",
    tag: "University",
    countryCode: "gb",
  },
  {
    label: "MBBS NMC Compliant",
    query: "mbbs",
    tag: "Medical",
    countryCode: "uz",
  },
  { label: "Cost Calculator", query: "cost calculator", tag: "Tool" },
  { label: "Executive MBA (EMBA)", query: "emba", tag: "Executive" },
  {
    label: "IELTS Academic Prep",
    query: "ielts",
    tag: "Exam",
    countryCode: "gb",
  },
];

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const { openAICounsellor } = useHomeModals();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryTab>("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    all: 0,
    universities: 0,
    courses: 0,
    programs: 0,
    destinations: 0,
    guides: 0,
    tools: 0,
    test_prep: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount / open
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("vista_recent_searches");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 5));
        }
      } catch {
        // ignore
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const updated = [
        trimmed,
        ...recentSearches.filter(
          (s) => s.toLowerCase() !== trimmed.toLowerCase(),
        ),
      ].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("vista_recent_searches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("vista_recent_searches");
    } catch {
      // ignore
    }
  };

  // Helper to log search analytics [FR-SEARCH-007]
  const trackSearchAnalytics = useCallback(
    (
      searchQuery: string,
      resultsCount: number,
      clickedItem?: { url: string; title: string },
    ) => {
      try {
        if (!searchQuery && !clickedItem) return;
        fetch("/api/search/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            resultsCount,
            category,
            clickedUrl: clickedItem?.url,
            clickedTitle: clickedItem?.title,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // silently handle tracking errors
        });
      } catch {
        // ignore
      }
    },
    [category],
  );

  // Live Database Search with Debounce (<200ms response time) [FR-SEARCH-002]
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const url = `/api/search?q=${encodeURIComponent(query)}&category=${category}&limit=30`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const fetchedResults = data.results || [];
            setResults(fetchedResults);
            if (data.counts) setCounts(data.counts);

            if (query.trim()) {
              trackSearchAnalytics(query.trim(), fetchedResults.length);
            }
          }
        }
      } catch (err) {
        console.warn("Search fetch error:", err);
      } finally {
        setIsLoading(false);
        setSelectedIndex(-1);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category, isOpen, trackSearchAnalytics]);

  const handleNavigate = useCallback(
    (url: string, title?: string) => {
      const activeQuery = query.trim();
      if (activeQuery) {
        saveRecentSearch(activeQuery);
        trackSearchAnalytics(
          activeQuery,
          results.length,
          title ? { url, title } : undefined,
        );
      }
      onClose();
      router.push(url);
    },
    [query, onClose, router, results.length, trackSearchAnalytics],
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleNavigate(
          results[selectedIndex].url,
          results[selectedIndex].title,
        );
      } else if (results.length > 0) {
        handleNavigate(results[0].url, results[0].title);
      }
    }
  };

  if (!isOpen) return null;

  const renderIcon = (item: SearchResultItem) => {
    // 1. Destination / Country Flag SVG rendering
    if (
      item.category === "destinations" ||
      item.iconType === "country" ||
      item.url.startsWith("/study-in-")
    ) {
      const countrySlug =
        item.countrySlug || item.url.replace("/study-in-", "");
      return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 shadow-2xs overflow-hidden">
          <CountryFlag
            code={item.countryCode || countrySlug}
            countryName={item.title.replace("Study in ", "")}
            size="md"
          />
        </span>
      );
    }

    // 2. Course Item with Flag SVG
    if (item.category === "courses" || item.iconType === "course") {
      if (item.countryCode) {
        return (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 shadow-2xs overflow-hidden">
            <CountryFlag
              code={item.countryCode}
              countryName={item.subtitle}
              size="md"
            />
          </span>
        );
      }
      return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D5A6C]/10 text-[#1D5A6C] border border-[#1D5A6C]/20">
          <BookOpen className="h-4 w-4" />
        </span>
      );
    }

    // 3. University Item
    if (item.category === "universities" || item.iconType === "university") {
      if (item.countryCode) {
        return (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D89A3E]/15 border border-[#D89A3E]/30 shadow-2xs overflow-hidden">
            <CountryFlag
              code={item.countryCode}
              countryName={item.subtitle}
              size="md"
            />
          </span>
        );
      }
      return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D89A3E]/15 text-[#D89A3E] border border-[#D89A3E]/30">
          <Building2 className="h-4 w-4" />
        </span>
      );
    }

    // 4. Program Item
    if (item.category === "programs" || item.iconType === "program") {
      return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7C6BAE]/15 text-[#7C6BAE] border border-[#7C6BAE]/30">
          <GraduationCap className="h-4 w-4" />
        </span>
      );
    }

    // 5. Guide / Blog Item
    if (item.category === "guides" || item.iconType === "guide") {
      return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#A8CDBD]/25 text-[#1D5A6C] border border-[#A8CDBD]/40">
          <FileText className="h-4 w-4" />
        </span>
      );
    }

    // 6. Tool Item
    if (item.category === "tools" || item.iconType === "tool") {
      return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D89A3E]/15 text-[#A67E2F] border border-[#D89A3E]/30">
          <Calculator className="h-4 w-4" />
        </span>
      );
    }

    // 7. Test Prep Exam Item
    if (item.category === "test_prep" || item.iconType === "test_prep") {
      return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D5A6C]/15 text-[#1D5A6C] border border-[#1D5A6C]/30">
          <ShieldCheck className="h-4 w-4" />
        </span>
      );
    }

    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Search className="h-4 w-4" />
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-3 sm:p-6 pt-12 sm:pt-20 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#D9CFB8] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="relative flex items-center border-b border-[#D9CFB8]/50 px-4 py-3.5 sm:px-5 bg-white">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-[#1D5A6C] animate-spin shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search universities, courses, programs, countries, guides, tools..."
            className="flex-1 border-0 bg-transparent px-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 font-sans font-normal"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition mr-1 cursor-pointer"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 items-center gap-1 rounded-lg border border-[#D9CFB8] bg-[#FDFCF7] px-2 text-[11px] font-semibold text-[#6B6B6B] hover:bg-[#F2ECD9] hover:text-[#103B47] transition cursor-pointer"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Filter Tabs [FR-SEARCH-001] Grouped by content type */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#D9CFB8]/60 bg-[#FDFCF7] px-3 py-2 text-xs no-scrollbar font-sans">
          {[
            { key: "all", label: "All Results", count: counts.all },
            {
              key: "destinations",
              label: "Countries",
              count: counts.destinations,
            },
            {
              key: "universities",
              label: "Universities",
              count: counts.universities,
            },
            { key: "courses", label: "Courses", count: counts.courses },
            { key: "programs", label: "Programs", count: counts.programs },
            { key: "guides", label: "Guides & Blog", count: counts.guides },
            { key: "tools", label: "Tools", count: counts.tools },
            { key: "test_prep", label: "Exams", count: counts.test_prep },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key as CategoryTab)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${
                category === tab.key
                  ? "bg-[#1D5A6C] text-[#F5EFE0] shadow-2xs font-semibold"
                  : "text-[#3A3A3A] hover:bg-[#F2ECD9] hover:text-[#103B47]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    category === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-[#D9CFB8]/50 text-[#103B47]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Results / Suggestions Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 text-xs">
          {/* If query is empty -> Show Recent & Popular Suggestions */}
          {!query.trim() && (
            <div className="space-y-5 py-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                      <Clock className="h-3.5 w-3.5 text-[#D89A3E]" />
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#6B6B6B] hover:text-[#B8593E] cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setQuery(s);
                          inputRef.current?.focus();
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-[#D9CFB8] bg-white px-3 py-1.5 text-[#3A3A3A] hover:border-[#D89A3E] hover:text-[#103B47] transition shadow-2xs cursor-pointer font-sans"
                      >
                        <Search className="h-3 w-3 text-[#6B6B6B]" />
                        <span className="font-medium">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Database Searches */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                  <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
                  Popular Suggestions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POPULAR_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        setQuery(s.query);
                        inputRef.current?.focus();
                      }}
                      className="flex items-center justify-between rounded-xl border border-[#D9CFB8]/60 bg-[#FDFCF7] p-2.5 text-left hover:bg-white hover:border-[#1D5A6C]/40 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {s.countryCode ? (
                          <CountryFlag code={s.countryCode} size="sm" />
                        ) : (
                          <Search className="h-3.5 w-3.5 text-[#6B6B6B] group-hover:text-[#D89A3E]" />
                        )}
                        <span className="font-bold text-[#1A1A1A] group-hover:text-[#103B47] font-sans">
                          {s.label}
                        </span>
                      </div>
                      <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold text-[#6B6B6B] border border-[#D9CFB8] font-mono">
                        {s.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          {query.trim() && (
            <div className="space-y-1.5">
              {results.length > 0 ? (
                results.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNavigate(item.url, item.title)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex items-center justify-between rounded-xl p-2.5 transition cursor-pointer ${
                        isSelected
                          ? "bg-[#F5EFE0] border border-[#D89A3E]/60 shadow-2xs"
                          : "hover:bg-[#FDFCF7] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {renderIcon(item)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[#1A1A1A] truncate text-[13px] group-hover:text-[#103B47] font-sans">
                              {item.title}
                            </p>
                            <span className="rounded-md bg-[#F2ECD9] px-1.5 py-0.5 text-[9px] font-bold text-[#103B47] shrink-0 font-mono">
                              {item.categoryLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5 font-sans">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {item.badge && (
                          <span className="hidden sm:inline-block rounded-md bg-[#1D5A6C]/10 px-2 py-0.5 text-[10px] font-bold text-[#103B47] border border-[#1D5A6C]/20 font-mono">
                            {item.badge}
                          </span>
                        )}
                        <ArrowRight
                          className={`h-4 w-4 transition-transform ${
                            isSelected
                              ? "text-[#D89A3E] translate-x-1"
                              : "text-[#D9CFB8] group-hover:text-[#103B47]"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              ) : !isLoading ? (
                /* [FR-SEARCH-003] Empty Search State with AI Counsellor CTA */
                <div className="py-10 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D89A3E]/15 text-[#D89A3E] border border-[#D89A3E]/30 shadow-2xs">
                      <Bot className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-display font-medium text-[#103B47]">
                      Nothing exact — but our AI Counsellor can help you explore
                    </p>
                    <p className="text-[12px] text-[#6B6B6B] max-w-md mx-auto font-sans">
                      Get instant personalized recommendations, eligibility
                      advice, and university shortlists for &ldquo;{query}
                      &rdquo;.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        const targetQuery = query.trim();
                        onClose();
                        openAICounsellor(
                          `Can you help me explore universities, programs, or requirements for "${targetQuery}"?`,
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1D5A6C] px-5 py-2.5 text-xs font-sans font-medium text-[#F5EFE0] shadow-md hover:bg-[#103B47] transition cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
                      <span>
                        Ask AI Counsellor about &ldquo;{query}&rdquo; →
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="flex items-center justify-between border-t border-[#D9CFB8]/60 bg-[#FDFCF7] px-4 py-2 text-[11px] text-[#6B6B6B] font-sans">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-[#D9CFB8] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#3A3A3A]">
                ↑
              </kbd>{" "}
              <kbd className="rounded border border-[#D9CFB8] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#3A3A3A]">
                ↓
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="rounded border border-[#D9CFB8] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#3A3A3A]">
                ↵
              </kbd>{" "}
              select
            </span>
            <span>
              <kbd className="rounded border border-[#D9CFB8] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#3A3A3A]">
                esc
              </kbd>{" "}
              close
            </span>
          </div>
          <span className="font-bold text-[#1D5A6C]">Abroadroute Search</span>
        </div>
      </div>
    </div>
  );
}
