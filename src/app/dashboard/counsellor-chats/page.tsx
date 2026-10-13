"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Bot,
  ArrowLeft,
  MessageSquare,
  Trash2,
  Calendar,
  Sparkles,
  ExternalLink,
  Search,
  User,
  LogOut,
  RefreshCw,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { AIChatMessage } from "@/types";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { getAuthHeaders } from "@/lib/supabase/client";

interface SavedConversation {
  id: string;
  session_id: string;
  title: string;
  user_email: string;
  page_context?: Record<string, any>;
  messages: AIChatMessage[];
  created_at: string;
  updated_at: string;
  lead_level?: number;
}

export default function CounsellorChatsDashboardPage() {
  const { user, logout, isLoggedIn } = useAuth();
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<SavedConversation | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChats = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Lists the signed-in user's own chats (identity from the login token)
      const res = await fetch("/api/ai/chats", {
        headers: await getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
          if (data.conversations.length > 0 && !selectedChat) {
            setSelectedChat(data.conversations[0]);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch counsellor chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user?.email]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat history?")) return;

    try {
      await fetch(`/api/ai/chats?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      setConversations((prev) =>
        prev.filter((c) => c.session_id !== sessionId),
      );
      if (selectedChat?.session_id === sessionId) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error("Delete chat error:", err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title?.toLowerCase().includes(q);
    const msgMatch = c.messages?.some((m) => m.text?.toLowerCase().includes(q));
    return titleMatch || msgMatch;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-[#D9CFB8]/60 bg-white/95 backdrop-blur-md px-4 py-3.5 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="wordmark" theme="light" size="md" />
            <span className="rounded-full bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-3 py-1 text-[11px] font-bold text-[#1D5A6C]">
              ✦ Route AI Chats
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/dashboard/student"
              className="min-h-[44px] flex items-center font-bold text-[#103B47] hover:text-[#1D5A6C] transition"
            >
              ← Student Dashboard
            </Link>
            <Link
              href="/ai-counsellor"
              className="min-h-[44px] flex items-center rounded-xl bg-[#D89A3E] px-4 py-2 font-bold text-[#103B47] shadow-xs hover:bg-[#EBC783] transition"
            >
              Start New Chat +
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#103B47]/60 mb-1">
              <Link href="/dashboard/student" className="hover:underline">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#103B47] font-medium">
                Counsellor Chats
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103B47]">
              Saved AI Counsellor Transcripts
            </h1>
            <p className="text-xs text-[#103B47]/70 mt-0.5">
              Review and continue your personalized study abroad guidance
              sessions powered by Route AI.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#103B47]/50" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-[#D9CFB8]/60 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-[#103B47] focus:border-[#103B47] focus:outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <RefreshCw className="h-6 w-6 animate-spin text-[#D89A3E]" />
            <span className="ml-2 text-xs font-semibold text-[#103B47]/70">
              Loading your conversation history...
            </span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-[#D9CFB8] bg-white p-12 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5EFE0] text-[#103B47] mb-4 border border-[#D9CFB8]/60">
              <Bot className="h-8 w-8 text-[#D89A3E]" />
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#103B47]">
              No Saved Conversations Yet
            </h3>
            <p className="text-xs text-[#103B47]/70 max-w-md mt-1 mb-6 leading-relaxed">
              Ask our AI Counsellor about universities, €0 tuition in Germany,
              NMC-compliant MBBS, or work visas. All your conversations will be
              auto-saved here.
            </p>
            <Link
              href="/ai-counsellor"
              className="min-h-[44px] inline-flex items-center rounded-xl bg-[#103B47] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1D5A6C] transition"
            >
              Start Your First Conversation →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* Conversation List (Left Column) */}
            <div className="lg:col-span-5 space-y-3">
              {filteredConversations.map((c) => {
                const isSelected = selectedChat?.session_id === c.session_id;
                const formattedDate = new Date(
                  c.updated_at || c.created_at,
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const userTurns = c.messages.filter(
                  (m) => m.role === "user",
                ).length;

                return (
                  <div
                    key={c.id || c.session_id}
                    onClick={() => setSelectedChat(c)}
                    className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition ${
                      isSelected
                        ? "border-[#103B47] bg-white shadow-md ring-1 ring-[#103B47]"
                        : "border-[#D9CFB8]/60 bg-white hover:border-[#103B47]/40 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE0] text-[#103B47] border border-[#D9CFB8]/40">
                          <MessageSquare className="h-4 w-4 text-[#D89A3E]" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#103B47] line-clamp-1">
                            {c.title || "Study Abroad Session"}
                          </h4>
                          <span className="text-[10px] font-mono text-[#103B47]/60 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {formattedDate} • {userTurns} questions asked
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(c.session_id, e)}
                        title="Delete chat"
                        className="text-[#103B47]/40 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Preview of last message */}
                    {c.messages && c.messages.length > 0 && (
                      <p className="mt-3 text-[11px] text-[#103B47]/80 line-clamp-2 leading-relaxed bg-[#FDFCF7] border border-[#D9CFB8]/40 p-2.5 rounded-xl font-medium">
                        {c.messages[c.messages.length - 1].text.substring(
                          0,
                          140,
                        )}
                        ...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Conversation Detail / Transcript (Right Column) */}
            <div className="lg:col-span-7 rounded-3xl border border-[#D9CFB8]/60 bg-white shadow-sm overflow-hidden flex flex-col max-h-[750px]">
              {selectedChat ? (
                <>
                  {/* Detail Header */}
                  <div className="border-b border-[#D9CFB8]/40 bg-[#103B47] p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                        {selectedChat.title}
                      </h3>
                      <p className="text-[10px] font-mono text-white/70 mt-0.5">
                        Session: {selectedChat.session_id} •{" "}
                        {selectedChat.messages.length} messages
                      </p>
                    </div>
                    <Link
                      href="/ai-counsellor"
                      className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-[#D89A3E] px-4 py-2 text-xs font-bold text-[#103B47] hover:bg-[#EBC783] transition shadow-xs self-start sm:self-center"
                    >
                      <span>Continue in AI Counsellor</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Transcript Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs bg-[#FDFCF7]">
                    {selectedChat.messages.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className={`flex gap-3 ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {m.role === "model" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE0] text-[#103B47] border border-[#D9CFB8]/40">
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
                          <div className="whitespace-pre-line text-xs leading-relaxed font-medium">
                            {m.text}
                          </div>
                          <span
                            className={`mt-2 block text-[9px] font-mono ${
                              m.role === "user"
                                ? "text-white/70"
                                : "text-[#103B47]/60"
                            }`}
                          >
                            {m.timestamp || "Transcript"}
                          </span>
                        </div>
                        {m.role === "user" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1D5A6C]/20 text-[#103B47] border border-[#1D5A6C]/30">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-12 text-[#103B47]/60 text-xs">
                  Select a conversation from the left to view the full
                  transcript.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
