import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { getContentTable, toContentRow } from "@/lib/siteContentConfig";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ table: string; id: string }>;
}

const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Admin access required" },
    { status: 403 },
  );

const badRequest = (error: string, status = 400) =>
  NextResponse.json({ success: false, error }, { status });

/** Replaces the row with the submitted fields. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const { table, id } = await params;
    const config = getContentTable(table);
    if (!config) return badRequest("Unknown content table", 404);
    if (!z.string().uuid().safeParse(id).success) return badRequest("Invalid id");

    const result = toContentRow(config, await request.json());
    if ("error" in result) return badRequest(result.error);

    let query = supabaseAdmin
      .from(config.table)
      .update({ ...result.row, updated_at: new Date().toISOString() })
      .eq("id", id);
    for (const [column, value] of Object.entries(config.match ?? {})) {
      query = query.eq(column, value);
    }
    const { data, error } = await query.select("*").maybeSingle();
    if (error) throw error;
    if (!data) return badRequest("Row not found", 404);

    return NextResponse.json({ success: true, row: data });
  } catch (error: any) {
    console.error("PATCH /api/admin/content error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update row" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const { table, id } = await params;
    const config = getContentTable(table);
    if (!config) return badRequest("Unknown content table", 404);
    if (!z.string().uuid().safeParse(id).success) return badRequest("Invalid id");

    let query = supabaseAdmin.from(config.table).delete().eq("id", id);
    for (const [column, value] of Object.entries(config.match ?? {})) {
      query = query.eq(column, value);
    }
    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/content error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete row" },
      { status: 500 },
    );
  }
}
