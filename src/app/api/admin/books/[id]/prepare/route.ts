import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BOOKS_BUCKET, bookPaths, splitPdf } from "@/lib/books/processing";

export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/books/[id]/prepare
 * Runs once after the PDF upload: counts pages and splits the book into
 * small chunk PDFs that /process OCRs one at a time.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data: book, error } = await supabaseAdmin
    .from("books")
    .select("id, storage_path, page_count")
    .eq("id", id)
    .single();

  if (error || !book) {
    return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 });
  }

  // Already prepared (e.g. resumed upload); nothing to do.
  if (book.page_count) {
    return NextResponse.json({ success: true, pageCount: book.page_count });
  }

  const fail = async (message: string, status = 500) => {
    await supabaseAdmin
      .from("books")
      .update({ status: "failed", error_message: message, updated_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: false, error: message }, { status });
  };

  const storage = supabaseAdmin.storage.from(BOOKS_BUCKET);
  const { data: file, error: downloadError } = await storage.download(book.storage_path);
  if (downloadError || !file) {
    return fail("Uploaded PDF could not be found in storage.", 404);
  }

  let split;
  try {
    split = await splitPdf(new Uint8Array(await file.arrayBuffer()));
  } catch (err) {
    console.error("PDF split error:", err);
    return fail("This file could not be read as a PDF. It may be corrupted or password-protected.", 400);
  }

  if (split.pageCount === 0) {
    return fail("The PDF has no pages.", 400);
  }

  // Upload chunks a few at a time to stay well inside the request timeout.
  const UPLOAD_CONCURRENCY = 8;
  for (let start = 0; start < split.chunks.length; start += UPLOAD_CONCURRENCY) {
    const results = await Promise.all(
      split.chunks.slice(start, start + UPLOAD_CONCURRENCY).map((chunk, offset) =>
        storage.upload(bookPaths.chunk(id, start + offset), chunk, {
          contentType: "application/pdf",
          upsert: true,
        }),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed) {
      console.error("Chunk upload error:", failed.error);
      return fail("Failed to prepare the PDF for OCR. Please retry.");
    }
  }

  await supabaseAdmin
    .from("books")
    .update({
      page_count: split.pageCount,
      pages_processed: 0,
      status: "processing",
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ success: true, pageCount: split.pageCount });
}
