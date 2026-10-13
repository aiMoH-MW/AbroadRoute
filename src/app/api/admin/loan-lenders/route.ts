import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { mapSupabaseLoanLender } from "@/lib/data/mappers";
import {
  loanLenderInputSchema,
  toLoanLenderRow,
} from "@/lib/loanLendersSchema";

export const dynamic = "force-dynamic";

const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Admin access required" },
    { status: 403 },
  );

/** All lenders, inactive ones included, in display order. */
export async function GET(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const { data, error } = await supabaseAdmin
      .from("loan_lenders")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;

    return NextResponse.json({
      success: true,
      lenders: (data ?? []).map(mapSupabaseLoanLender),
    });
  } catch (error: any) {
    console.error("GET /api/admin/loan-lenders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch lenders" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const parsed = loanLenderInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("loan_lenders")
      .insert(toLoanLenderRow(parsed.data))
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({
      success: true,
      lender: mapSupabaseLoanLender(data),
    });
  } catch (error: any) {
    console.error("POST /api/admin/loan-lenders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add lender" },
      { status: 500 },
    );
  }
}
