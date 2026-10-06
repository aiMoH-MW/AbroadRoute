import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { STUDY_MATERIALS_BUCKET, materialPaths, splitPdf, splitTextIntoPages } from "@/lib/studyMaterials/processing";

export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/study-materials/[id]/prepare
 * Runs once after upload. PDFs are counted and split into small chunk PDFs
 * that /process OCRs one at a time; TXT files need no OCR, so their text is
 * split into pages and stored directly (the material is completed here).
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data: material, error } = await supabaseAdmin
    .from("study_materials")
    .select("id, storage_path, page_count")
    .eq("id", id)
    .single();

  if (error || !material) {
    return NextResponse.json({ success: false, error: "Material not found" }, { status: 404 });
  }

  // Already prepared (e.g. resumed upload); nothing to do.
  if (material.page_count) {
    return NextResponse.json({ success: true, pageCount: material.page_count });
  }

  const fail = async (message: string, status = 500) => {
    await supabaseAdmin
      .from("study_materials")
      .update({ status: "failed", error_message: message, updated_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: false, error: message }, { status });
  };

  const storage = supabaseAdmin.storage.from(STUDY_MATERIALS_BUCKET);
  const { data: file, error: downloadError } = await storage.download(material.storage_path);
  if (downloadError || !file) {
    return fail("Uploaded file could not be found in storage.", 404);
  }

  if (material.storage_path.endsWith(".txt")) {
    const pages = splitTextIntoPages(await file.text());
    if (pages.length === 0) {
      return fail("The text file is empty.", 400);
    }

    const INSERT_BATCH = 200;
    for (let start = 0; start < pages.length; start += INSERT_BATCH) {
      const { error: pagesError } = await supabaseAdmin.from("study_material_pages").upsert(
        pages.slice(start, start + INSERT_BATCH).map((content, i) => ({
          material_id: id,
          page_number: start + i + 1,
          content,
        })),
        { onConflict: "material_id,page_number" },
      );
      if (pagesError) {
        console.error("Material pages upsert error:", pagesError);
        return fail("Failed to store the text. Please retry.");
      }
    }

    await supabaseAdmin
      .from("study_materials")
      .update({
        page_count: pages.length,
        pages_processed: pages.length,
        status: "completed",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ success: true, pageCount: pages.length });
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
        storage.upload(materialPaths.chunk(id, start + offset), chunk, {
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
    .from("study_materials")
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
