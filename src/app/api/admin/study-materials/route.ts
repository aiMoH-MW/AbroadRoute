import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import { STUDY_MATERIALS_BUCKET, materialFileKind, materialPaths } from "@/lib/studyMaterials/processing";

const MAX_FILE_BYTES = 100 * 1024 * 1024;

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null));

const createMaterialSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(300),
  author: optionalText,
  edition: optionalText,
  description: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => (v ? v : null)),
  examSlug: optionalText,
  programSlug: optionalText,
  specialisationSlug: optionalText,
  subject: optionalText,
  tags: z.array(z.string().trim().min(1).max(64)).max(30).optional().default([]),
  language: optionalText,
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .refine((n) => /\.(pdf|txt)$/i.test(n), "Only PDF or TXT files are supported"),
  fileSize: z.number().int().positive().max(MAX_FILE_BYTES, "File must be 100 MB or smaller"),
});

/**
 * GET /api/admin/study-materials?exam=&program=&specialisation=&q=
 * Lists uploaded materials, newest first.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  let query = supabaseAdmin
    .from("study_materials")
    .select("*")
    .order("created_at", { ascending: false });

  const exam = searchParams.get("exam");
  const program = searchParams.get("program");
  const specialisation = searchParams.get("specialisation");
  const q = searchParams.get("q")?.trim().replace(/[%,()]/g, "");

  if (exam) query = query.eq("exam_slug", exam);
  if (program) query = query.eq("program_slug", program);
  if (specialisation) query = query.eq("specialisation_slug", specialisation);
  if (q) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,subject.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) {
    console.error("Materials fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, items: data ?? [] });
}

/**
 * POST /api/admin/study-materials
 * Creates the material record and returns a signed URL so the browser can upload
 * the PDF/TXT file straight to Supabase Storage (avoids request body size limits).
 */
export async function POST(req: NextRequest) {
  try {
    const input = createMaterialSchema.parse(await req.json());
    const id = crypto.randomUUID();
    const storagePath = materialPaths.original(id, materialFileKind(input.fileName));

    const { data: upload, error: uploadError } = await supabaseAdmin.storage
      .from(STUDY_MATERIALS_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (uploadError || !upload) {
      console.error("Materials signed upload URL error:", uploadError);
      return NextResponse.json(
        { success: false, error: uploadError?.message || "Could not prepare file upload" },
        { status: 500 },
      );
    }

    const { data: material, error } = await supabaseAdmin
      .from("study_materials")
      .insert({
        id,
        title: input.title,
        author: input.author,
        edition: input.edition,
        description: input.description,
        exam_slug: input.examSlug,
        program_slug: input.programSlug,
        specialisation_slug: input.specialisationSlug,
        subject: input.subject,
        tags: input.tags,
        language: input.language ?? "English",
        storage_path: storagePath,
        file_name: input.fileName,
        file_size_bytes: input.fileSize,
        status: "uploaded",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Materials insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      material,
      upload: { bucket: STUDY_MATERIALS_BUCKET, path: upload.path, token: upload.token },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("Materials POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to create material" }, { status: 500 });
  }
}
