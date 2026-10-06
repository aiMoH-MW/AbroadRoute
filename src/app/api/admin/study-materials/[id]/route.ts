import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { STUDY_MATERIALS_BUCKET, materialPaths } from "@/lib/studyMaterials/processing";

interface Params {
  params: Promise<{ id: string }>;
}

const PAGE_LIMIT = 20;

/**
 * GET /api/admin/study-materials/[id]?from=1
 * Returns the material plus up to 20 extracted pages starting at page `from`.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const from = Math.max(1, Number(new URL(req.url).searchParams.get("from")) || 1);

  const { data: material, error } = await supabaseAdmin
    .from("study_materials")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !material) {
    return NextResponse.json({ success: false, error: "Material not found" }, { status: 404 });
  }

  const { data: pages, error: pagesError } = await supabaseAdmin
    .from("study_material_pages")
    .select("page_number, content")
    .eq("material_id", id)
    .gte("page_number", from)
    .order("page_number", { ascending: true })
    .limit(PAGE_LIMIT);

  if (pagesError) {
    return NextResponse.json({ success: false, error: pagesError.message }, { status: 500 });
  }

  const { data: signed } = await supabaseAdmin.storage
    .from(STUDY_MATERIALS_BUCKET)
    .createSignedUrl(material.storage_path, 60 * 10);

  return NextResponse.json({
    success: true,
    material,
    pages: pages ?? [],
    pdfUrl: signed?.signedUrl ?? null,
  });
}

/**
 * DELETE /api/admin/study-materials/[id]
 * Removes the original file, its OCR chunks and all extracted pages.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const storage = supabaseAdmin.storage.from(STUDY_MATERIALS_BUCKET);

  const { data: chunkFiles } = await storage.list(materialPaths.chunksDir(id), { limit: 1000 });
  const paths = [
    materialPaths.original(id, "pdf"),
    materialPaths.original(id, "txt"),
    ...(chunkFiles ?? []).map((f) => `${materialPaths.chunksDir(id)}/${f.name}`),
  ];
  const { error: storageError } = await storage.remove(paths);
  if (storageError) {
    console.error("Materials storage delete error:", storageError);
  }

  const { error } = await supabaseAdmin.from("study_materials").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
