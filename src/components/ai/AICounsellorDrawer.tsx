"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Send,
  Sparkles,
  User,
  PhoneCall,
  Lock,
  ArrowRight,
  RotateCcw,
  Maximize2,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { AIChatMessage } from "@/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { getSavedShortlist } from "@/lib/cookies/shortlist";
import { getContextAwareGreeting } from "@/lib/gemini/counsellorKnowledge";
import {
  AIChatActionCard,
  parseMessageActions,
} from "@/components/ai/AIChatActionCard";
import { PeacockEye } from "@/components/ui/BrandSignatures";
import { getAuthHeaders } from "@/lib/supabase/client";

interface AICounsellorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeadModal?: () => void;
  onOpenAuthModal?: () => void;
  initialQuery?: string;
}

export function AICounsellorDrawer({
  isOpen,
  onClose,
  onOpenLeadModal,
  onOpenAuthModal,
  initialQuery,
}: AICounsellorDrawerProps) {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const instanceId = useId();
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session ID once on mount
  useEffect(() => {
    const existing =
      sessionStorage.getItem("route_ai_session_id") ||
      sessionStorage.getItem("vista_counsellor_session_id");
    if (existing) {
      setSessionId(existing);
    } else {
      const newId = `session_${crypto.randomUUID()}`;
      sessionStorage.setItem("route_ai_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  // [FR-AI-002] Context-aware initial prompt
  const initialGreetingText = getContextAwareGreeting(pathname);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "initial",
      role: "model",
      text: initialGreetingText,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Which European countries have €0 tuition?",
    "Best NMC-compliant MBBS universities?",
    "How does Germany Ausbildung dual training work?",
    "Top MS in Computer Science under ₹25 Lakhs?",
  ]);

  // Progressive Lead Capture States (FR-AI-005)
  const [showLevel2LeadCapture, setShowLevel2LeadCapture] = useState(false);
  const [level2Captured, setLevel2Captured] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");

  // Progressive Level 3 State (FR-AI-005)
  const [showLevel3Consultation, setShowLevel3Consultation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle Level 2 lead submit
  const handleSaveLevel2Lead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName || "Route AI Student",
          email: leadEmail,
          source: "ai_counsellor_drawer_l2",
          notes: `Lead captured via ✦ Route AI Drawer. Session ID: ${sessionId}`,
        }),
      });
      setLevel2Captured(true);
      setShowLevel2LeadCapture(false);
    } catch {
      setLevel2Captured(true);
      setShowLevel2LeadCapture(false);
    }
  };

  // Reset chat
  const handleClearChat = () => {
    setMessages([
      {
        id: "initial_reset",
        role: "model",
        text: "Conversation reset. How can ✦ Route AI guide your global education journey today?",
        timestamp: "Just now",
      },
    ]);
  };

  // Persist conversation to Supabase / Storage
  const persistConversation = async (
    msgs: AIChatMessage[],
    leadCapturedStage: number = 1,
  ) => {
    if (!sessionId) return;
    try {
      // Same endpoint as the full-page counsellor; the account comes from
      // the login token
      await fetch("/api/ai/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          sessionId,
          messages: msgs,
          leadLevel: leadCapturedStage,
          leadEmail: leadEmail || null,
          leadName: leadName || null,
          pageContext: { url: pathname },
        }),
      });
    } catch (e) {
      console.error("Failed to persist AI conversation", e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || loading) return;

    const newMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: "Just now",
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const userMessageCount = updatedMessages.filter(
      (m) => m.role === "user",
    ).length;
    if (userMessageCount === 3 && !level2Captured && !user?.email) {
      setShowLevel2LeadCapture(true);
    }

    try {
      const savedShortlist = getSavedShortlist(user);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "",
          timestamp: "Just now",
        },
      ]);

      const response = await fetch("/api/ai/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: updatedMessages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          pageContext: {
            pathname,
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
        throw new Error("No response stream body");
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
            "I have analyzed your query. How else may I assist your global education roadmap?",
          timestamp: "Just now",
        },
      ];

      // Auto-save conversation
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
            "I experienced a brief connection glitch. Please try again or connect with our human study abroad counsellor.";
        }
        return newArr;
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#103B47]/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-[#FDFCF7] shadow-2xl transition-all sm:rounded-l-2xl border-l border-[#D9CFB8]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1D5A6C]/50 bg-[#103B47] px-6 py-4 text-white sm:rounded-tl-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D5A6C] text-[#D89A3E] shadow-xs">
              <span className="text-base font-bold">✦</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-semibold text-sm text-white">
                  Route AI Counsellor
                </h3>
                {isLoggedIn ? (
                  <span
                    className="flex h-2 w-2 rounded-full bg-emerald-400"
                    title="Active & Authenticated"
                  />
                ) : (
                  <span
                    className="flex h-2 w-2 rounded-full bg-[#D89A3E]"
                    title="Login Required"
                  />
                )}
              </div>
              <p className="text-[10px] text-[#A8CDBD] font-mono">
                {isLoggedIn
                  ? `Active: ${user?.name || user?.email}`
                  : "Context-Aware · Zero Sales Bias"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/ai-counsellor"
              onClick={onClose}
              title="Open full page counsellor"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 transition"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Link>
            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* If user is NOT logged in: Show Lock banner at top */}
        {!isLoggedIn && (
          <div className="bg-[#F5EFE0] border-b border-[#D9CFB8] p-4 text-[#103B47]">
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1D5A6C]/15 text-[#1D5A6C]">
                <Lock className="h-4 w-4 text-[#D89A3E]" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-[#103B47] font-display">
                  Login Required to Chat
                </h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B6B6B]">
                  ✦ Route AI Counsellor is available to logged-in students &
                  parents. Sign in or register to unlock personalized admissions
                  and visa guidance in ₹ Lakhs.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="rounded-md bg-[#1D5A6C] px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-[#103B47] transition"
                  >
                    Sign In →
                  </Link>
                  <Link
                    href="/signup"
                    onClick={onClose}
                    className="rounded-md border border-[#D9CFB8] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#103B47] hover:bg-[#F5EFE0] transition"
                  >
                    Create Free Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat History Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FDFCF7]">
          {messages.map((m) => {
            const { cleanText, actions } = parseMessageActions(m.text);

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "model" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1D5A6C] text-[#D89A3E] shadow-xs">
                    <span className="text-xs font-bold">✦</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1D5A6C] text-white"
                      : "border border-[#D9CFB8] bg-white text-[#1A1A1A] shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-line text-xs leading-relaxed space-y-1">
                    {cleanText}
                  </div>

                  {/* Interactive Function Action Cards */}
                  {actions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {actions.map((act, aIdx) => (
                        <AIChatActionCard
                          key={aIdx}
                          action={act}
                          onOpenLeadModal={() => {
                            onClose();
                            onOpenLeadModal?.();
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <span
                    className={`mt-1.5 block text-[9px] ${
                      m.role === "user" ? "text-[#A8CDBD]" : "text-[#6B6B6B]"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F5EFE0] text-[#103B47] border border-[#D9CFB8]">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-[#6B6B6B] text-xs pl-2">
              <span className="flex h-2 w-2 animate-ping rounded-full bg-[#D89A3E]"></span>
              <span>
                ✦ Route AI is querying verified admissions database...
              </span>
            </div>
          )}

          {/* Progressive Lead Capture: Save Chat Prompt */}
          {showLevel2LeadCapture && !level2Captured && !user?.email && (
            <div className="rounded-xl border border-[#1D5A6C]/30 bg-[#F5EFE0] p-3.5 text-[#103B47] shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1D5A6C] text-white shadow-xs">
                  <Mail className="h-4 w-4 text-[#D89A3E]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs text-[#103B47] font-display">
                    Save this Conversation & University Shortlist
                  </h4>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                    Enter your email to receive a saved transcript and tailored
                    admission notes.
                  </p>
                  <form
                    onSubmit={handleSaveLevel2Lead}
                    className="mt-2.5 space-y-2"
                  >
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="w-1/2 rounded-md border border-[#D9CFB8] bg-white px-2.5 py-1.5 text-xs text-[#1A1A1A]"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className="w-1/2 rounded-md border border-[#D9CFB8] bg-white px-2.5 py-1.5 text-xs text-[#1A1A1A]"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-md bg-[#1D5A6C] py-1.5 text-xs font-semibold text-white hover:bg-[#103B47] transition"
                    >
                      Save My Transcript →
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {level2Captured && (
            <div className="flex items-center gap-2 rounded-lg bg-[#A8CDBD]/20 border border-[#A8CDBD] p-2.5 text-xs font-medium text-[#103B47]">
              <CheckCircle2 className="h-4 w-4 text-[#1D5A6C] shrink-0" />
              <span>
                Transcript & shortlists will be saved to{" "}
                {leadEmail || user?.email}
              </span>
            </div>
          )}

          {/* Progressive Level 3: 1-on-1 Consultation */}
          {showLevel3Consultation && (
            <div className="rounded-xl border border-[#D89A3E]/40 bg-[#F5EFE0] p-3.5 text-[#103B47] shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#D89A3E] text-[#103B47] shadow-xs">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs text-[#103B47] font-display">
                    Ready for 1-on-1 Human Profile Review?
                  </h4>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                    Connect with an authorized Abroadroute senior counsellor for
                    application filing, visa checks, and scholarship guidance.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLeadModal?.();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#D89A3E] px-3 py-1.5 text-xs font-semibold text-[#103B47] shadow-xs hover:bg-[#c4872d] transition"
                  >
                    Book Free 1-on-1 Session
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="border-t border-[#D9CFB8]/60 bg-[#F5EFE0] px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#103B47] mb-1.5 font-mono">
            Suggested Queries:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  if (!isLoggedIn) {
                    if (onOpenAuthModal) onOpenAuthModal();
                  } else {
                    handleSendMessage(q);
                  }
                }}
                className="rounded-md border border-[#D9CFB8] bg-white px-2.5 py-1 text-[10px] font-medium text-[#1A1A1A] hover:border-[#1D5A6C] hover:text-[#103B47] transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-[#D9CFB8] p-3 bg-white sm:rounded-bl-2xl">
          {isLoggedIn ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about universities, fees in ₹ Lakhs, visas..."
                className="flex-1 rounded-lg border border-[#D9CFB8] px-3.5 py-2 text-xs text-[#1A1A1A] placeholder-[#6B6B6B] focus:border-[#1D5A6C] focus:outline-none bg-[#FDFCF7]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D5A6C] text-white transition hover:bg-[#103B47] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-[#D9CFB8] bg-[#F5EFE0] p-2 text-xs">
              <div className="flex items-center gap-2 text-[#6B6B6B] pl-1">
                <Lock className="h-4 w-4 text-[#D89A3E]" />
                <span className="text-[11px]">Sign in required to chat</span>
              </div>
              <Link
                href="/login"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-md bg-[#D89A3E] px-3 py-1.5 text-[11px] font-semibold text-[#103B47] shadow-xs hover:bg-[#c4872d]"
              >
                Sign In
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Quick Lead & Full Screen Actions */}
          <div className="mt-2 flex items-center justify-between px-1 text-[10px]">
            <button
              onClick={() => {
                onClose();
                onOpenLeadModal?.();
              }}
              className="inline-flex items-center gap-1 font-semibold text-[#1D5A6C] hover:underline"
            >
              <PhoneCall className="h-3 w-3 text-[#D89A3E]" />
              Need human guidance? Book 1-on-1 advisor call
            </button>
            <Link
              href="/ai-counsellor"
              onClick={onClose}
              className="text-[#6B6B6B] hover:text-[#1D5A6C] hover:underline font-mono"
            >
              Full Screen Mode ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
