import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import {
  UNIVERSITY_MEDIA_BUCKET,
  UNIVERSITY_MEDIA_COLUMNS,
  UNIVERSITY_MEDIA_MAX_BYTES,
  UNIVERSITY_MEDIA_TYPES,
  UniversityMediaKind,
  isUniversityMediaKind,
  storagePathFromPublicUrl,
} from "@/lib/universityMedia";

export const dynamic = "force-dynamic";

// Logo and banner uploads for a university. Admins can change any
// university; a verified partner only the one claimed by their account.
//   POST   { slug, kind, contentType, size } -> signed upload URL
//   PUT    { slug, kind, path }              -> saves the uploaded file
//   DELETE { slug, kind }                    -> removes the image

interface UniversityRow {
  id: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
}

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

async function authorize(
  request: Request,
  body: any,
): Promise<{ uni: UniversityRow; kind: UniversityMediaKind } | NextResponse> {
  const user = await getRequestUser(request);
  if (!user) return fail("Authentication required", 401);

  const kind = body?.kind;
  if (!isUniversityMediaKind(kind)) return fail("kind must be 'logo' or 'banner'", 400);

  const slug = String(body?.slug ?? "").trim().toLowerCase();
  if (!slug) return fail("slug is required", 400);

  let query = supabaseAdmin
    .from("universities")
    .select("id, slug, logo_url, banner_url")
    .eq("slug", slug);
  if (!isAdminUser(user)) query = query.eq("claimed_by_user_id", user.id);

  const { data, error } = await query.maybeSingle();
  if (error) return fail(error.message, 500);
  if (!data) {
    return fail(
      isAdminUser(user)
        ? "University is not in the database yet. Save it first."
        : "You can only change images for your own university",
      isAdminUser(user) ? 404 : 403,
    );
  }
  return { uni: data as UniversityRow, kind };
}

async function removeStoredFile(url: string | null) {
  const path = storagePathFromPublicUrl(url);
  if (!path) return;
  const { error } = await supabaseAdmin.storage.from(UNIVERSITY_MEDIA_BUCKET).remove([path]);
  if (error) console.warn("University media cleanup failed:", error.message);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const auth = await authorize(request, body);
    if (auth instanceof NextResponse) return auth;
    const { uni, kind } = auth;

    const ext = UNIVERSITY_MEDIA_TYPES[String(body.contentType)];
    if (!ext) return fail("Only PNG, JPG or WebP images are allowed", 400);
    const size = Number(body.size);
    if (!Number.isFinite(size) || size <= 0) return fail("File is empty", 400);
    if (size > UNIVERSITY_MEDIA_MAX_BYTES[kind]) {
      const mb = UNIVERSITY_MEDIA_MAX_BYTES[kind] / (1024 * 1024);
      return fail(`The ${kind} must be ${mb} MB or smaller`, 400);
    }

    const path = `${uni.id}/${kind}-${Date.now()}.${ext}`;
    const { data, error } = await supabaseAdmin.storage
      .from(UNIVERSITY_MEDIA_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) {
      return fail(error?.message || "Could not prepare the upload", 500);
    }
    return NextResponse.json({ success: true, path: data.path, token: data.token });
  } catch (error: any) {
    console.error("POST /api/universities/media error:", error);
    return fail(error.message || "Upload failed", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const auth = await authorize(request, body);
    if (auth instanceof NextResponse) return auth;
    const { uni, kind } = auth;

    // Only files this route issued for this university and kind
    const path = String(body.path ?? "");
    const fileName = path.slice(uni.id.length + 1);
    if (
      !path.startsWith(`${uni.id}/${kind}-`) ||
      fileName.includes("/") ||
      fileName.includes("..")
    ) {
      return fail("Invalid file path", 400);
    }

    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(UNIVERSITY_MEDIA_BUCKET)
      .list(uni.id, { search: fileName, limit: 1 });
    if (listError) return fail(listError.message, 500);
    if (!files?.some((f) => f.name === fileName)) {
      return fail("Uploaded file was not found. Please upload again.", 404);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(UNIVERSITY_MEDIA_BUCKET).getPublicUrl(path);
    const column = UNIVERSITY_MEDIA_COLUMNS[kind];

    const { error } = await supabaseAdmin
      .from("universities")
      .update({ [column]: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", uni.id);
    if (error) return fail(error.message, 500);

    if (uni[column] !== publicUrl) await removeStoredFile(uni[column]);
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("PUT /api/universities/media error:", error);
    return fail(error.message || "Could not save the image", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const auth = await authorize(request, body);
    if (auth instanceof NextResponse) return auth;
    const { uni, kind } = auth;
    const column = UNIVERSITY_MEDIA_COLUMNS[kind];

    const { error } = await supabaseAdmin
      .from("universities")
      .update({ [column]: null, updated_at: new Date().toISOString() })
      .eq("id", uni.id);
    if (error) return fail(error.message, 500);

    await removeStoredFile(uni[column]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/universities/media error:", error);
    return fail(error.message || "Could not remove the image", 500);
  }
}
