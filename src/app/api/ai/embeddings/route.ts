import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, GEMINI_EMBED_MODEL } from "@/lib/gemini/client";

/**
 * API Route to convert user message or text content to vector embedding
 * Endpoint: POST /api/ai/embeddings
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, texts, model } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in server environment." },
        { status: 500 },
      );
    }

    const embedModel =
      model || process.env.GEMINI_EMBEDDING_MODEL || GEMINI_EMBED_MODEL;

    // Handle batch texts conversion
    if (Array.isArray(texts) && texts.length > 0) {
      const results: number[][] = [];
      for (const t of texts) {
        if (typeof t === "string" && t.trim()) {
          const vec = await generateEmbedding(t.trim(), embedModel);
          results.push(vec);
        }
      }

      return NextResponse.json({
        success: true,
        embeddings: results,
        count: results.length,
        dimensions: results[0]?.length || 0,
        model: embedModel,
      });
    }

    // Handle single text conversion
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Field 'text' (string) or 'texts' (string[]) is required." },
        { status: 400 },
      );
    }

    const vector = await generateEmbedding(text.trim(), embedModel);

    return NextResponse.json({
      success: true,
      text: text.trim(),
      embedding: vector,
      dimensions: vector.length,
      model: embedModel,
    });
  } catch (error: unknown) {
    console.error("Vector Embedding Generation Error:", error);
    const errMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate vector embedding",
        details:
          process.env.NODE_ENV === "development" ? errMessage : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "AbroadRoute Vector Embedding Service",
    model: process.env.GEMINI_EMBEDDING_MODEL || GEMINI_EMBED_MODEL,
    dimensions: 3072,
    configured: Boolean(process.env.GEMINI_API_KEY),
  });
}
