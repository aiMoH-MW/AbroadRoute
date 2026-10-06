import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { STUDY_MATERIALS_BUCKET, PAGES_PER_CHUNK, materialPaths, ocrPdfChunk } from "@/lib/studyMaterials/processing";
import type { ProcessProgress } from "@/lib/studyMaterials/types";

export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/study-materials/[id]/process
 * OCRs the next unprocessed chunk and stores its pages. The admin UI calls
 * this repeatedly until `done` is true, so a stopped run can simply resume.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data: material, error } = await supabaseAdmin
    .from("study_materials")
    .select("id, page_count, pages_processed, status")
    .eq("id", id)
    .single();

  if (error || !material) {
    return NextResponse.json({ success: false, error: "Material not found" }, { status: 404 });
  }
  if (!material.page_count) {
    return NextResponse.json(
      { success: false, error: "Material has not been prepared yet." },
      { status: 409 },
    );
  }

  const pageCount: number = material.page_count;
  const progress = (pagesProcessed: number, status: ProcessProgress["status"]): ProcessProgress => ({
    status,
    pageCount,
    pagesProcessed,
    done: pagesProcessed >= pageCount,
  });

  if (material.pages_processed >= pageCount) {
    return NextResponse.json({ success: true, ...progress(pageCount, "completed") });
  }

  const chunkIndex = Math.floor(material.pages_processed / PAGES_PER_CHUNK);
  const firstPage = chunkIndex * PAGES_PER_CHUNK + 1;
  const pagesInChunk = Math.min(PAGES_PER_CHUNK, pageCount - firstPage + 1);

  const { data: chunk, error: downloadError } = await supabaseAdmin.storage
    .from(STUDY_MATERIALS_BUCKET)
    .download(materialPaths.chunk(id, chunkIndex));

  let texts: string[];
  try {
    if (downloadError || !chunk) throw new Error("PDF chunk is missing from storage.");
    texts = await ocrPdfChunk(new Uint8Array(await chunk.arrayBuffer()), pagesInChunk);
  } catch (err) {
    const message = `OCR failed on pages ${firstPage}–${firstPage + pagesInChunk - 1}: ${
      err instanceof Error ? err.message : "unknown error"
    }`;
    console.error(message, err);
    await supabaseAdmin
      .from("study_materials")
      .update({ status: "failed", error_message: message, updated_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }

  const { error: pagesError } = await supabaseAdmin.from("study_material_pages").upsert(
    texts.map((content, i) => ({
      material_id: id,
      page_number: firstPage + i,
      content,
    })),
    { onConflict: "material_id,page_number" },
  );
  if (pagesError) {
    console.error("Material pages upsert error:", pagesError);
    return NextResponse.json({ success: false, error: pagesError.message }, { status: 500 });
  }

  const pagesProcessed = firstPage - 1 + pagesInChunk;
  const status = pagesProcessed >= pageCount ? "completed" : "processing";
  await supabaseAdmin
    .from("study_materials")
    .update({
      pages_processed: pagesProcessed,
      status,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ success: true, ...progress(pagesProcessed, status) });
}
