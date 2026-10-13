import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { getContentTable, toContentRow } from "@/lib/siteContentConfig";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ table: string }>;
}

const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Admin access required" },
    { status: 403 },
  );

const unknownTable = () =>
  NextResponse.json(
    { success: false, error: "Unknown content table" },
    { status: 404 },
  );

/** All rows of a content table, inactive ones included, in display order. */
export async function GET(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const config = getContentTable((await params).table);
    if (!config) return unknownTable();

    let query = supabaseAdmin.from(config.table).select("*");
    for (const [column, value] of Object.entries(config.match ?? {})) {
      query = query.eq(column, value);
    }
    const { data, error } = await query
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;

    return NextResponse.json({ success: true, rows: data ?? [] });
  } catch (error: any) {
    console.error("GET /api/admin/content error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load content" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const config = getContentTable((await params).table);
    if (!config) return unknownTable();

    const result = toContentRow(config, await request.json());
    if ("error" in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from(config.table)
      .insert(result.row)
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, row: data });
  } catch (error: any) {
    console.error("POST /api/admin/content error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add row" },
      { status: 500 },
    );
  }
}
