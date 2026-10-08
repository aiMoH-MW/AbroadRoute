import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/gemini/client";
import crypto from "crypto";

export interface AICounsellorKBItem {
  id: string;
  title: string;
  content: string;
  comment?: string | null;
  embedding?: number[] | null;
  created_date?: string;
  updated_date?: string;
}

/**
 * GET /api/admin/kb
 * Fetch all knowledge base entries from Supabase ai_counsellor_kb using server admin client
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q");

    let query = supabaseAdmin
      .from("ai_counsellor_kb")
      .select("id, title, content, comment, created_date, updated_date")
      .order("created_date", { ascending: false });

    if (search && search.trim()) {
      query = query.or(
        `title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%,comment.ilike.%${search.trim()}%`,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase KB fetch error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    // Which entries actually have an embedding (without loading the vectors)
    const { data: embedded } = await supabaseAdmin
      .from("ai_counsellor_kb")
      .select("id")
      .not("embedding", "is", null);
    const embeddedIds = new Set((embedded || []).map((r: any) => String(r.id)));
    const items = (data || []).map((item: any) => ({
      ...item,
      hasEmbedding: embeddedIds.has(String(item.id)),
    }));

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (err: unknown) {
    console.error("KB GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch knowledge base entries" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/kb
 * Convert title + content to vector embedding and insert into ai_counsellor_kb via supabaseAdmin
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, comment } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required." },
        { status: 400 },
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Content is required." },
        { status: 400 },
      );
    }

    // 1. Convert title and content to high-dimensional vector embedding using Gemini
    const textToEmbed = `${title.trim()}\n\n${content.trim()}`;
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(textToEmbed);
    } catch (embErr) {
      console.error("Gemini embedding error during KB creation:", embErr);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to convert title and content to vector embedding.",
        },
        { status: 500 },
      );
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    // 2. Insert into Supabase table ai_counsellor_kb using elevated supabaseAdmin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("ai_counsellor_kb")
      .insert({
        id: newId,
        title: title.trim(),
        content: content.trim(),
        comment: comment && typeof comment === "string" ? comment.trim() : null,
        embedding: embedding,
        created_date: now,
        updated_date: now,
      })
      .select("id, title, content, comment, created_date, updated_date")
      .single();

    if (error) {
      console.error("Supabase KB insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      item: data,
      vectorDimensions: embedding?.length || 0,
      message: "Knowledge entry converted to vector and saved successfully!",
    });
  } catch (err: unknown) {
    console.error("KB POST error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save knowledge base entry" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/kb
 * Update an existing entry and regenerate vector embedding
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, content, comment } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Record ID is required for update." },
        { status: 400 },
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and Content cannot be empty." },
        { status: 400 },
      );
    }

    // Regenerate vector embedding
    const textToEmbed = `${title.trim()}\n\n${content.trim()}`;
    const embedding = await generateEmbedding(textToEmbed);

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("ai_counsellor_kb")
      .update({
        title: title.trim(),
        content: content.trim(),
        comment: comment ? comment.trim() : null,
        embedding: embedding,
        updated_date: now,
      })
      .eq("id", id)
      .select("id, title, content, comment, created_date, updated_date")
      .single();

    if (error) {
      console.error("Supabase KB update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      item: data,
      vectorDimensions: embedding?.length || 0,
      message: "Knowledge entry and vector updated successfully!",
    });
  } catch (err: unknown) {
    console.error("KB PUT error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update knowledge base entry" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/kb
 * Delete a knowledge base entry by ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID query parameter is required." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("ai_counsellor_kb")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase KB delete error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Knowledge entry #${id} deleted successfully.`,
    });
  } catch (err: unknown) {
    console.error("KB DELETE error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete knowledge base entry" },
      { status: 500 },
    );
  }
}
