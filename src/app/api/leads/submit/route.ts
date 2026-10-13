import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

const leadSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  countryTarget: z.string().optional(),
  programTarget: z.string().min(1, "Please select a study stream"),
  highestEducation: z.string().optional(),
  budgetRangeINR: z.string().optional(),
  intakeYear: z.string().optional(),
  // Set when the inquiry is made from a university's page
  universityId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = leadSchema.parse(body);

    // Attempt to store in Supabase PostgreSQL
    let dbRecord = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const payload = {
          full_name: validated.fullName,
          email: validated.email,
          phone: validated.phone,
          // Only what the student entered; unanswered fields stay null
          country_target: validated.countryTarget || null,
          program_target: validated.programTarget,
          highest_education: validated.highestEducation || null,
          budget_range_inr: validated.budgetRangeINR || null,
          intake_year: validated.intakeYear || null,
          status: "raw",
          // Inquiry from a university page (columns from migration 0022)
          ...(validated.universityId
            ? { university_id: validated.universityId, university_status: "new" }
            : {}),
        };

        let { data, error } = await supabaseAdmin.from("leads").insert([payload]).select();
        // Before migration 0022 the university columns don't exist: keep the lead anyway
        if (error && validated.universityId && /university_(id|status)/.test(error.message)) {
          const { university_id: _u, university_status: _s, ...basePayload } = payload as any;
          ({ data, error } = await supabaseAdmin.from("leads").insert([basePayload]).select());
        }

        // No fallback through the public key: leads are not publicly writable
        if (error) {
          console.error("Supabase admin insert error:", error);
        } else if (data && data.length > 0) {
          dbRecord = data[0];
        }
      }
    } catch (dbErr) {
      console.warn("Database storage exception:", dbErr);
    }

    // Don't tell the student we have their details when nothing was saved
    if (!dbRecord) {
      return NextResponse.json(
        { error: "We couldn't save your request. Please try again in a moment." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully. An admission counsellor will reach out within 24 hours.",
      lead: validated,
      dbData: dbRecord,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process inquiry" }, { status: 500 });
  }
}
