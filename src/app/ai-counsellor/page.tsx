"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  User,
  PhoneCall,
  Lock,
  ArrowRight,
  RotateCcw,
  Compass,
  Building2,
  Calculator,
  Bookmark,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Mail,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { AIChatMessage } from "@/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { getSavedShortlist } from "@/lib/cookies/shortlist";
import { getContextAwareGreeting } from "@/lib/gemini/counsellorKnowledge";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import {
  AIChatActionCard,
  parseMessageActions,
} from "@/components/ai/AIChatActionCard";
import { LeadModal } from "@/components/lead/LeadModal";
import { useSiteStats } from "@/lib/useSiteStats";
import { withCount } from "@/lib/siteStatsFormat";
import { useSiteContent } from "@/lib/useSiteContent";
import type { AiSuggestedQuestion } from "@/lib/siteContent";
import { getAuthHeaders } from "@/lib/supabase/client";

export default function AICounsellorFullPage() {
  const siteStats = useSiteStats();
  // Starter questions (admin: Site Content → AI Counsellor Questions)
  const starterQuestions = useSiteContent<AiSuggestedQuestion[]>(
    "ai-questions",
    [],
  );
  const categorizedQuestions = Array.from(
    starterQuestions
      .reduce((map, q) => {
        map.set(q.category, [...(map.get(q.category) ?? []), q.question]);
        return map;
      }, new Map<string, string[]>())
      .entries(),
  ).map(([category, questions]) => ({ category, questions }));
  const { user, isLoggedIn, logout } = useAuth();
  const [sessionId, setSessionId] = useState<string>("");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  // Initialize session ID
  useEffect(() => {
    const existing = sessionStorage.getItem("vista_counsellor_session_id");
    if (existing) {
      setSessionId(existing);
    } else {
      const newId = `session_${crypto.randomUUID()}`;
      sessionStorage.setItem("vista_counsellor_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "initial",
      role: "model",
      text: getContextAwareGreeting("/ai-counsellor"),
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Progressive Lead Capture State (FR-AI-005)
  const [showLevel2LeadCapture, setShowLevel2LeadCapture] = useState(false);
  const [level2Captured, setLevel2Captured] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [showLevel3Consultation, setShowLevel3Consultation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // [FR-AI-004] Auto-save conversation to database
  const persistConversation = async (
    currentMessages: AIChatMessage[],
    leadLevel = 1,
  ) => {
    if (!sessionId || currentMessages.length <= 1) return;
    try {
      // The account comes from the login token; lead details are kept as context
      await fetch("/api/ai/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          sessionId,
          leadEmail: leadEmail || null,
          leadName: leadName || null,
          pageContext: { url: "/ai-counsellor" },
          messages: currentMessages,
          leadLevel,
        }),
      });
    } catch (e) {
      console.warn("Auto-save conversation error:", e);
    }
  };

  const handleClearChat = () => {
    const freshId = `session_${crypto.randomUUID()}`;
    sessionStorage.setItem("vista_counsellor_session_id", freshId);
    setSessionId(freshId);

    setMessages([
      {
        id: "initial-" + Date.now(),
        role: "model",
        text: getContextAwareGreeting("/ai-counsellor"),
        timestamp: "Just now",
      },
    ]);
    setShowLevel2LeadCapture(false);
    setShowLevel3Consultation(false);
  };

  const handleSaveLevel2Lead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.trim()) return;
    setLevel2Captured(true);
    await persistConversation(messages, 2);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: "Just now",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const userMessageCount = updatedMessages.filter(
      (m) => m.role === "user",
    ).length;
    if (userMessageCount >= 5 && !level2Captured && !user?.email) {
      setShowLevel2LeadCapture(true);
    }
    if (userMessageCount >= 10) {
      setShowLevel3Consultation(true);
    }

    const savedShortlist = getSavedShortlist(user);

    const placeholderModelMsg: AIChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "model",
      text: "",
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, placeholderModelMsg]);

    try {
      // [FR-AI-007] Streaming fetch
      const response = await fetch("/api/ai/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: updatedMessages.slice(-8).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          pageContext: {
            url: "/ai-counsellor",
          },
          userProfile: {
            name: user?.name || leadName,
            email: user?.email || leadEmail,
          },
          shortlist: savedShortlist,
          stream: true,
        }),
      });

      const leadCaptureHeader = response.headers.get("X-Lead-Capture");
      if (leadCaptureHeader === "true") {
        setShowLevel3Consultation(true);
      }

      if (!response.body) {
        throw new Error("No stream body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) => {
          const newArr = [...prev];
          const last = newArr[newArr.length - 1];
          if (last && last.role === "model") {
            last.text = accumulatedText;
          }
          return newArr;
        });
      }

      const finalMessages = [
        ...updatedMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "model" as const,
          text:
            accumulatedText ||
            "How else can I assist your study abroad roadmap?",
          timestamp: "Just now",
        },
      ];

      persistConversation(
        finalMessages,
        showLevel3Consultation ? 3 : showLevel2LeadCapture ? 2 : 1,
      );
    } catch {
      setMessages((prev) => {
        const newArr = [...prev];
        const last = newArr[newArr.length - 1];
        if (last && last.role === "model" && !last.text) {
          last.text =
            "I experienced a brief connection glitch. Please try asking your question again or connect with our human counsellor.";
        }
        return newArr;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#FDFCF7]">
      {/* Top Navbar */}
      <header className="border-b border-[#D9CFB8]/60 bg-white/95 backdrop-blur-md px-4 py-3.5 sm:px-6 sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="wordmark" theme="light" size="md" />
            <div className="hidden items-center gap-2 border-l border-[#D9CFB8]/60 pl-3 sm:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-3 py-1 text-xs font-bold text-[#1D5A6C]">
                <Bot className="h-3.5 w-3.5 text-[#D89A3E]" /> Route AI
                Counsellor
              </span>
              <span className="text-xs text-[#103B47]/70 font-medium">
                Context-Aware
                {siteStats.countries > 0 &&
                  ` • ${withCount(siteStats.countries, "Destinations")}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/counsellor-chats"
                  className="min-h-[44px] hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#D9CFB8] bg-white px-3.5 py-2 font-bold text-[#103B47] hover:bg-[#F5EFE0] transition shadow-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#D89A3E]" />
                  <span>Saved Chats</span>
                </Link>
                <Link
                  href="/dashboard/student"
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-[#103B47] px-4 py-2 font-bold text-white hover:bg-[#1D5A6C] transition shadow-xs"
                >
                  <User className="h-3.5 w-3.5 text-[#D89A3E]" />
                  <span>Dashboard</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="min-h-[44px] flex items-center rounded-xl border border-[#D9CFB8] bg-white px-4 py-2 font-bold text-[#103B47] hover:bg-[#F5EFE0] transition shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="min-h-[44px] flex items-center rounded-xl bg-[#D89A3E] px-4 py-2 font-bold text-[#103B47] shadow-xs hover:bg-[#EBC783] transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main 2-Column Full Screen Workspace */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden p-2 sm:p-4 gap-4">
        {/* Main Chat Stream (Left / Center) */}
        <div className="flex flex-1 flex-col rounded-2xl sm:rounded-3xl border border-[#D9CFB8]/60 bg-white shadow-sm overflow-hidden">
          {/* Subheader */}
          <div className="flex items-center justify-between border-b border-[#1D5A6C]/50 bg-[#103B47] px-4 py-3 sm:px-5 sm:py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D5A6C] text-[#D89A3E] shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-serif text-xs font-bold sm:text-sm">
                  Personalized Admissions & Visa Assistant
                </h2>
                <p className="text-[10px] text-[#A8CDBD] font-mono">
                  Live vector RAG knowledge from Supabase & verified regulations
                </p>
              </div>
            </div>
            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
              >
                <RotateCcw className="h-3 w-3 text-[#D89A3E]" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm bg-[#FDFCF7]">
            {messages.map((m) => {
              const { cleanText, actions } = parseMessageActions(m.text);

              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "model" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE0] text-[#103B47] border border-[#D9CFB8]/60 shadow-xs">
                      <Sparkles className="h-4 w-4 text-[#D89A3E]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#103B47] text-white shadow-xs"
                        : "border border-[#D9CFB8]/60 bg-white text-[#103B47] shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed space-y-2 font-medium">
                      {cleanText}
                    </div>

                    {/* Action Cards (FR-AI-006) */}
                    {actions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {actions.map((act, aIdx) => (
                          <AIChatActionCard
                            key={aIdx}
                            action={act}
                            onOpenLeadModal={(cntry) => {
                              setSelectedCountry(cntry || "");
                              setLeadModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <span
                      className={`mt-2 block text-[10px] font-mono ${
                        m.role === "user"
                          ? "text-white/70"
                          : "text-[#103B47]/60"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {m.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1D5A6C]/20 text-[#103B47] border border-[#1D5A6C]/30 shadow-xs">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-[#103B47]/70 text-xs pl-2 font-medium">
                <span className="flex h-2.5 w-2.5 animate-ping rounded-full bg-[#D89A3E]"></span>
                <span>Thinking & querying verified university catalog...</span>
              </div>
            )}

            {/* Level 2 Lead Capture (FR-AI-005) */}
            {showLevel2LeadCapture && !level2Captured && !user?.email && (
              <div className="rounded-2xl border border-[#D9CFB8] bg-[#F5EFE0] p-4 sm:p-5 text-[#103B47] shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#103B47] text-white">
                    <Mail className="h-5 w-5 text-[#D89A3E]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#103B47]">
                      Save this Consultation & University Shortlist
                    </h4>
                    <p className="text-xs text-[#103B47]/80 mt-0.5 leading-relaxed">
                      Enter your details to receive this entire transcript,
                      admission checklist, and scholarship links in your inbox.
                    </p>
                    <form
                      onSubmit={handleSaveLevel2Lead}
                      className="mt-3.5 flex flex-col sm:flex-row gap-2.5"
                    >
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="min-h-[44px] rounded-xl border border-[#D9CFB8]/60 bg-white px-3.5 py-2 text-xs text-[#103B47] focus:border-[#103B47] focus:outline-none"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Your Email Address"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className="min-h-[44px] flex-1 rounded-xl border border-[#D9CFB8]/60 bg-white px-3.5 py-2 text-xs text-[#103B47] focus:border-[#103B47] focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#103B47] px-5 py-2 text-xs font-bold text-white hover:bg-[#1D5A6C] transition shadow-xs cursor-pointer"
                      >
                        Save Transcript →
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {level2Captured && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Transcript and tailored recommendations will be emailed to{" "}
                  {leadEmail || user?.email}
                </span>
              </div>
            )}

            {/* Level 3 Lead Capture (FR-AI-005) */}
            {showLevel3Consultation && (
              <div className="rounded-2xl border border-[#D89A3E] bg-[#F5EFE0] p-4 sm:p-5 text-[#103B47] shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#103B47] text-[#D89A3E]">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#103B47]">
                      Need 1-on-1 Profile Review & Visa Filing Support?
                    </h4>
                    <p className="text-xs text-[#103B47]/80 mt-0.5 leading-relaxed">
                      Schedule a dedicated video/phone consultation with an
                      authorized senior counsellor.
                    </p>
                    <button
                      onClick={() => setLeadModalOpen(true)}
                      className="min-h-[44px] mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#D89A3E] px-4 py-2 text-xs font-bold text-[#103B47] shadow-xs hover:bg-[#EBC783] transition cursor-pointer"
                    >
                      <span>Book 1-on-1 Counsellor Session</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-[#D9CFB8]/60 p-3 sm:p-4 bg-white">
            {isLoggedIn ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about universities, scholarships, tuition fees in ₹ Lakhs, visa rules..."
                  className="min-h-[44px] flex-1 rounded-xl border border-[#D9CFB8]/60 px-4 py-2.5 text-xs sm:text-sm text-[#103B47] placeholder-[#103B47]/40 focus:border-[#103B47] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#103B47] text-white transition hover:bg-[#1D5A6C] disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Send className="h-4 w-4 text-[#D89A3E]" />
                </button>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#D9CFB8] bg-[#F5EFE0] p-3.5 text-xs">
                <div className="flex items-center gap-2.5 text-[#103B47]">
                  <Lock className="h-4 w-4 text-[#D89A3E] shrink-0" />
                  <span className="font-medium">
                    Free account required to chat with Route AI Counsellor
                  </span>
                </div>
                <Link
                  href="/login"
                  className="min-h-[44px] inline-flex items-center justify-center gap-1 rounded-xl bg-[#D89A3E] px-4 py-2 font-bold text-[#103B47] shadow-xs hover:bg-[#EBC783] transition"
                >
                  <span>Sign In to Chat</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with Categorized Questions & Tools (Right Column) */}
        <div className="hidden w-80 lg:flex flex-col gap-4 overflow-y-auto">
          {/* Quick Action Tools */}
          <div className="rounded-3xl border border-[#D9CFB8]/60 bg-white p-5 shadow-xs">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#103B47] flex items-center gap-1.5 mb-3.5">
              <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" /> Quick Tools
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/cost-calculator"
                className="min-h-[44px] flex items-center justify-between rounded-xl border border-[#D9CFB8]/40 bg-[#FDFCF7] p-2.5 hover:border-[#1D5A6C]/40 hover:bg-[#F5EFE0] transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="h-4 w-4 text-[#1D5A6C]" />
                  <span className="text-xs font-semibold text-[#103B47]">
                    Cost Calculator
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#103B47]/40 group-hover:text-[#103B47] transition" />
              </Link>
              <Link
                href="/universities"
                className="min-h-[44px] flex items-center justify-between rounded-xl border border-[#D9CFB8]/40 bg-[#FDFCF7] p-2.5 hover:border-[#1D5A6C]/40 hover:bg-[#F5EFE0] transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-[#103B47]" />
                  <span className="text-xs font-semibold text-[#103B47]">
                    University Finder
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#103B47]/40 group-hover:text-[#103B47] transition" />
              </Link>
              <Link
                href="/compare/universities"
                className="min-h-[44px] flex items-center justify-between rounded-xl border border-[#D9CFB8]/40 bg-[#FDFCF7] p-2.5 hover:border-[#1D5A6C]/40 hover:bg-[#F5EFE0] transition group"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-[#D89A3E]" />
                  <span className="text-xs font-semibold text-[#103B47]">
                    Compare Programs
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#103B47]/40 group-hover:text-[#D89A3E] transition" />
              </Link>
            </div>
          </div>

          {/* Categorized Suggested Questions */}
          <div className="flex-1 rounded-3xl border border-[#D9CFB8]/60 bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#103B47] flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-[#D89A3E]" /> Suggested
              Questions
            </h3>

            {categorizedQuestions.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-[11px] font-bold text-[#103B47]/80 uppercase tracking-wider">
                  {cat.category}
                </h4>
                <div className="space-y-1.5">
                  {cat.questions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendMessage(q)}
                      className="w-full text-left rounded-xl border border-[#D9CFB8]/40 bg-[#FDFCF7] p-2.5 text-[11px] text-[#103B47] hover:border-[#103B47] hover:bg-[#F5EFE0] transition leading-snug cursor-pointer font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Human Advisor Booking Card */}
          <div className="rounded-3xl border border-[#D9CFB8] bg-[#F5EFE0] p-5 text-[#103B47] shadow-xs">
            <div className="flex items-center gap-2 text-[#103B47] font-serif font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-[#D89A3E]" />
              Verified Counsellors
            </div>
            <p className="text-[11px] text-[#103B47]/80 mt-1.5 leading-relaxed">
              Prefer speaking with a human study abroad mentor? Book a 100% free
              consultation session.
            </p>
            <button
              onClick={() => setLeadModalOpen(true)}
              className="min-h-[44px] mt-3.5 w-full rounded-xl bg-[#103B47] py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-[#1D5A6C] transition cursor-pointer"
            >
              Book 1-on-1 Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Lead Modal */}
      {leadModalOpen && (
        <LeadModal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
          defaultCountry={selectedCountry}
        />
      )}
    </div>
  );
}
