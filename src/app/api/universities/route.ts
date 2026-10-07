import { NextResponse } from "next/server";
import { fetchLiveUniversities } from "@/lib/supabase/dataFetchers";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country")?.toLowerCase() || "";
    const query =
      searchParams.get("query")?.toLowerCase() ||
      searchParams.get("q")?.toLowerCase() ||
      "";

    let universities = await fetchLiveUniversities();

    if (country) {
      universities = universities.filter(
        (u) =>
          u.countrySlug?.toLowerCase() === country ||
          u.country?.toLowerCase() === country,
      );
    }

    if (query) {
      universities = universities.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.city.toLowerCase().includes(query) ||
          u.country.toLowerCase().includes(query),
      );
    }

    return NextResponse.json({
      success: true,
      count: universities.length,
      universities,
    });
  } catch (error: any) {
    console.error("API /api/universities error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch universities",
      },
      { status: 500 },
    );
  }
}

// Fields a caller may change; claim/featured state is managed by the claims flow.
const EDITABLE_FIELDS = [
  "name",
  "city",
  "ranking_global",
  "ranking_national",
  "tuition_fee_range_inr",
  "ielts_min_score",
  "acceptance_rate",
  "post_study_work_months",
] as const;
const NUMERIC_FIELDS = new Set([
  "ranking_global",
  "ranking_national",
  "ielts_min_score",
  "acceptance_rate",
  "post_study_work_months",
]);

// Accepts a country id ("uk"), slug or display name ("United Kingdom").
async function resolveCountryId(input: string): Promise<string | null> {
  const value = input.trim().toLowerCase();
  if (!value) return null;
  const { data } = await supabaseAdmin.from("countries").select("id, name, slug");
  const match = (data || []).find(
    (c: any) =>
      c.id?.toLowerCase() === value ||
      c.slug?.toLowerCase() === value ||
      c.name?.toLowerCase() === value,
  );
  return match?.id || null;
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }
    const isAdmin = isAdminUser(user);

    const body = await request.json();
    const slug = body.slug?.toString().trim().toLowerCase();
    if (isAdmin && !slug) {
      return NextResponse.json(
        { success: false, error: "slug is required" },
        { status: 400 },
      );
    }

    const updates: Record<string, any> = {};
    for (const field of EDITABLE_FIELDS) {
      const value = body[field];
      if (value === undefined || value === null || value === "") continue;
      if (NUMERIC_FIELDS.has(field)) {
        const num = Number(value);
        if (Number.isNaN(num)) {
          return NextResponse.json(
            { success: false, error: `${field} must be a number` },
            { status: 400 },
          );
        }
        updates[field] = num;
      } else {
        updates[field] = String(value).trim();
      }
    }

    if (body.country) {
      const countryId = await resolveCountryId(String(body.country));
      if (!countryId) {
        return NextResponse.json(
          { success: false, error: `Unknown country: ${body.country}` },
          { status: 400 },
        );
      }
      updates.country_id = countryId;
    }

    // Admins target a university by slug; partners can only edit the one they own
    const lookup = supabaseAdmin
      .from("universities")
      .select("id, claimed_by_user_id");
    const { data: existing, error: fetchError } = await (isAdmin
      ? lookup.eq("slug", slug)
      : lookup.eq("claimed_by_user_id", user.id).limit(1)
    ).maybeSingle();
    if (fetchError) throw fetchError;

    if (!existing) {
      // Only admins may add new universities to the catalog
      if (!isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: "No verified university is linked to your account yet",
          },
          { status: 403 },
        );
      }
      if (!updates.name || !updates.country_id || !updates.city) {
        return NextResponse.json(
          { success: false, error: "name, country and city are required" },
          { status: 400 },
        );
      }
      const { data, error } = await supabaseAdmin
        .from("universities")
        .insert({ ...updates, slug })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: "University created successfully",
        university: data,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("universities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "University saved to database successfully",
      university: data,
    });
  } catch (error: any) {
    console.error("POST /api/universities error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save university" },
      { status: 500 },
    );
  }
}
