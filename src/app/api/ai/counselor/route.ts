import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { searchSimilarDocuments } from "@/lib/supabase/vectorSearch";
import {
  buildSystemPrompt,
  getSmartFollowUpQuestions,
  AIPageContext,
  AIUserProfile,
} from "@/lib/gemini/counsellorKnowledge";
import { fetchLiveCountries } from "@/lib/supabase/dataFetchers";
import {
  fetchAiSuggestedQuestions,
  fetchSiteSettings,
} from "@/lib/siteContent";

interface IncomingHistoryItem {
  role?: string;
  text?: string;
}

/**
 * Sanitizes and formats chat history to comply strictly with Google Generative AI requirements:
 * 1. Must start with role: 'user' (removes any leading 'model' messages).
 * 2. Roles must strictly alternate: 'user' -> 'model' -> 'user' -> 'model'...
 * 3. Drops empty turns or invalid roles.
 */
function sanitizeGeminiHistory(
  rawHistory: IncomingHistoryItem[],
): Array<{ role: "user" | "model"; parts: [{ text: string }] }> {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) {
    return [];
  }

  // 1. Filter out turns without valid text or role
  const validTurns = rawHistory
    .filter(
      (h) =>
        h &&
        typeof h.text === "string" &&
        h.text.trim().length > 0 &&
        (h.role === "user" || h.role === "model"),
    )
    .map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("model" as const),
      text: (h.text || "").trim(),
    }));

  // 2. Drop any leading 'model' turns (Gemini requires the first turn to be 'user')
  while (validTurns.length > 0 && validTurns[0].role !== "user") {
    validTurns.shift();
  }

  if (validTurns.length === 0) {
    return [];
  }

  // 3. Ensure strictly alternating roles (merge adjacent turns with same role)
  const alternating: Array<{
    role: "user" | "model";
    parts: [{ text: string }];
  }> = [];

  for (const turn of validTurns) {
    if (alternating.length === 0) {
      alternating.push({
        role: turn.role,
        parts: [{ text: turn.text }],
      });
    } else {
      const lastIndex = alternating.length - 1;
      const last = alternating[lastIndex];

      if (last.role === turn.role) {
        // Merge consecutive turns with the same role
        last.parts[0].text = `${last.parts[0].text}\n${turn.text}`;
      } else {
        alternating.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
      }
    }
  }

  return alternating;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      pageContext = {} as AIPageContext,
      userProfile = {} as AIUserProfile,
      shortlist = [],
      stream = false,
    } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A valid message string is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Follow-up suggestions from the admin-managed starter questions
    const starterQuestions = await fetchAiSuggestedQuestions();
    const suggestedNext = getSmartFollowUpQuestions(
      message,
      starterQuestions,
      pageContext,
    );

    // Detect consultation / high-intent triggers (FR-AI-005 Level 3 trigger)
    const lower = message.toLowerCase();
    const isConsultationIntent =
      lower.includes("apply") ||
      lower.includes("admission") ||
      lower.includes("contact") ||
      lower.includes("advisor") ||
      lower.includes("counsellor") ||
      lower.includes("counselor") ||
      lower.includes("call me") ||
      lower.includes("phone") ||
      lower.includes("whatsapp") ||
      lower.includes("consultant") ||
      lower.includes("scholarship apply") ||
      lower.includes("shortlist my profile") ||
      lower.includes("book session");

    // If no API key configured, provide domain-aware fallback response
    if (!apiKey) {
      // Without the AI model there is no verified answer to give, so point
      // the student to a human counsellor instead of quoting canned facts.
      const reply =
        'The AI counsellor is not available right now. You can browse destinations, universities and tools on the site, or book a free call with a counsellor.\n\n[[ACTION:BOOK_CALL:{"reason":"General Profile Evaluation"}]]';

      if (stream) {
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(reply));
            controller.close();
          },
        });
        return new Response(readable, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Suggested-Next": encodeURIComponent(
              JSON.stringify(suggestedNext),
            ),
            "X-Lead-Capture": isConsultationIntent ? "true" : "false",
          },
        });
      }

      return NextResponse.json({
        success: true,
        reply,
        model: "abroadroute-rule-engine-preview",
        suggestedNext,
        leadCapturePrompt: isConsultationIntent,
      });
    }

    // 1. Prepare base system instructions with dynamic session context & guardrails
    const [countries, settings] = await Promise.all([
      fetchLiveCountries(),
      fetchSiteSettings(),
    ]);
    const baseSystemPrompt = buildSystemPrompt(
      pageContext,
      userProfile,
      shortlist?.length,
      countries.map((c) => c.name),
      { name: settings.company_name, founder: settings.founder_name },
    );

    // 2. Perform vector search in Supabase ai_counsellor_kb to retrieve verified facts (RAG)
    let ragContextSection = "";
    try {
      const matchedDocs = await searchSimilarDocuments(message, 0.45, 4);
      if (matchedDocs && matchedDocs.length > 0) {
        ragContextSection = `\n\n### RETRIEVED VERIFIED FACTS (from Supabase Knowledge Base):\n${matchedDocs
          .map(
            (d, idx) =>
              `${idx + 1}. **${d.title}**\n${d.content}${d.comment ? `\n*Note: ${d.comment}*` : ""}`,
          )
          .join(
            "\n\n",
          )}\n\nUse the above verified facts where applicable to accurately answer the student's question.`;
      }
    } catch (ragErr) {
      console.warn(
        "RAG Vector Search error (continuing with base knowledge):",
        ragErr,
      );
    }

    const fullSystemPrompt = `${baseSystemPrompt}${ragContextSection}`;
    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const model = getGeminiModel(modelName, fullSystemPrompt);

    // 3. Format and sanitize previous conversation turns strictly for Gemini
    const formattedHistory = sanitizeGeminiHistory(history);
    const chat = model.startChat({
      history: formattedHistory,
    });

    // 4. [FR-AI-007] Streaming response for sub-2-second first token latency
    if (stream) {
      const streamResult = await chat.sendMessageStream(message);
      const encoder = new TextEncoder();

      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResult.stream) {
              const chunkText = chunk.text();
              controller.enqueue(encoder.encode(chunkText));
            }
            controller.close();
          } catch (streamErr) {
            console.error("Streaming error in Gemini stream:", streamErr);
            controller.error(streamErr);
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "X-Suggested-Next": encodeURIComponent(JSON.stringify(suggestedNext)),
          "X-Lead-Capture": isConsultationIntent ? "true" : "false",
        },
      });
    }

    // Non-streaming standard JSON response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const replyText = response.text();

    return NextResponse.json({
      success: true,
      reply: replyText,
      model: modelName,
      suggestedNext,
      leadCapturePrompt: isConsultationIntent,
    });
  } catch (error: unknown) {
    console.error("AI Counsellor API Error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response",
        details:
          process.env.NODE_ENV === "development" ? errMessage : undefined,
        fallback:
          "I experienced a temporary connection issue. You can ask again, explore our university catalog, or book a 1-on-1 advisor call.",
        suggestedNext: (await fetchAiSuggestedQuestions())
          .slice(0, 4)
          .map((q) => q.question),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Abroadroute AI Counsellor API",
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    configured: Boolean(process.env.GEMINI_API_KEY),

    features: [
      "FR-AI-001 Floating Trigger",
      "FR-AI-002 Context Aware Greeting",
      "FR-AI-003 Full Page Counsellor",
      "FR-AI-004 DB Persistence",
      "FR-AI-005 Progressive Lead Capture",
      "FR-AI-006 Function Calling & Site Actions",
      "FR-AI-007 Streaming Response (<2s first token)",
      "FR-AI-008 Ethical Guardrails & Compliance",
    ],
  });
}
