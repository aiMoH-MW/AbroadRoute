import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { BOOKS_BUCKET, bookPaths } from "@/lib/books/processing";

interface Params {
  params: Promise<{ id: string }>;
}

const PAGE_LIMIT = 20;

/**
 * GET /api/admin/books/[id]?from=1
 * Returns the book plus up to 20 extracted pages starting at page `from`.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const from = Math.max(1, Number(new URL(req.url).searchParams.get("from")) || 1);

  const { data: book, error } = await supabaseAdmin
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !book) {
    return NextResponse.json({ success: false, error: "Book not found" }, { status: 404 });
  }

  const { data: pages, error: pagesError } = await supabaseAdmin
    .from("book_pages")
    .select("page_number, content")
    .eq("book_id", id)
    .gte("page_number", from)
    .order("page_number", { ascending: true })
    .limit(PAGE_LIMIT);

  if (pagesError) {
    return NextResponse.json({ success: false, error: pagesError.message }, { status: 500 });
  }

  const { data: signed } = await supabaseAdmin.storage
    .from(BOOKS_BUCKET)
    .createSignedUrl(book.storage_path, 60 * 10);

  return NextResponse.json({
    success: true,
    book,
    pages: pages ?? [],
    pdfUrl: signed?.signedUrl ?? null,
  });
}

/**
 * DELETE /api/admin/books/[id]
 * Removes the PDF, its OCR chunks and all extracted pages.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const storage = supabaseAdmin.storage.from(BOOKS_BUCKET);

  const { data: chunkFiles } = await storage.list(bookPaths.chunksDir(id), { limit: 1000 });
  const paths = [
    bookPaths.original(id),
    ...(chunkFiles ?? []).map((f) => `${bookPaths.chunksDir(id)}/${f.name}`),
  ];
  const { error: storageError } = await storage.remove(paths);
  if (storageError) {
    console.error("Books storage delete error:", storageError);
  }

  const { error } = await supabaseAdmin.from("books").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
