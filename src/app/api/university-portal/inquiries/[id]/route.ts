import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireUniversityOwner } from "@/lib/universityPortal";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: z.enum(["new", "reviewing", "shortlisted", "contacted"]),
});

/** Updates how the university is handling one of its inquiries. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireUniversityOwner(request);
    if ("response" in auth) return auth.response;
    const { id } = await params;
    const parsed = bodySchema.safeParse(await request.json());
    if (!z.string().uuid().safeParse(id).success || !parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    // Only inquiries made from this university's page
    const { data, error } = await supabaseAdmin
      .from("leads")
      .update({ university_status: parsed.data.status })
      .eq("id", id)
      .eq("university_id", auth.university.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/university-portal/inquiries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 },
    );
  }
}
