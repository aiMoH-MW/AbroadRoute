import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { error: "Only administrators can review claims." },
        { status: user ? 403 : 401 },
      );
    }

    const body = await request.json();
    const { claimId, universityId, userId, action } = body;

    if (!claimId || !action) {
      return NextResponse.json(
        {
          error: "Claim ID and action ('approved' | 'rejected') are required.",
        },
        { status: 400 },
      );
    }

    const newStatus = action === "approved" ? "approved" : "rejected";

    const isValidUuid = (id: any) =>
      typeof id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );

    const validUserId = isValidUuid(userId) ? userId : null;

    // Known slug alias mapping
    const SLUG_ALIAS_MAP: Record<string, string> = {
      utoronto: "university-of-toronto",
      tum: "technical-university-of-munich",
      gatech: "georgia-tech",
      oxford: "university-of-oxford",
      stanford: "stanford-university",
      manchester: "university-of-manchester",
      tcd: "trinity-college-dublin",
      unimelb: "university-of-melbourne",
      tashkent: "tashkent-medical-academy",
      sorbonne: "sorbonne-university",
      hec: "hec-paris",
      polytechnique: "polytechnique-paris",
      essec: "essec-business-school",
      psl: "psl-university",
      tudelft: "tu-delft",
      sapienza: "sapienza-university-of-rome",
      nus: "national-university-of-singapore",
      auckland: "university-of-auckland",
    };

    // 1. Fetch existing claim record if available
    // Supabase returns errors instead of throwing; surface them so a failed
    // step is reported to the admin rather than silently marked successful.
    const check = (error: { message: string } | null, step: string) => {
      if (error) throw new Error(`${step}: ${error.message}`);
    };

    let claimRecord: any = null;
    if (isValidUuid(claimId)) {
      const { data, error } = await supabaseAdmin
        .from("university_claims")
        .select("*")
        .eq("id", claimId)
        .maybeSingle();
      check(error, "Failed to load claim");
      if (!data) {
        return NextResponse.json({ error: "Claim not found." }, { status: 404 });
      }
      claimRecord = data;
    }

    // 2. Update claim status in Supabase university_claims table
    {
      const statusUpdate = {
        verification_status: newStatus,
        reviewed_at: new Date().toISOString(),
      };
      if (isValidUuid(claimId)) {
        const { error } = await supabaseAdmin
          .from("university_claims")
          .update(statusUpdate)
          .eq("id", claimId);
        check(error, "Failed to update claim status");
      } else if (universityId) {
        const { error } = await supabaseAdmin
          .from("university_claims")
          .update(statusUpdate)
          .eq("university_id", universityId);
        check(error, "Failed to update claim status");
      }

      // 3. If approved, link university ownership in universities table
      if (newStatus === "approved") {
        const rawUniId = (universityId || claimRecord?.university_id || "")
          .toLowerCase()
          .trim();
        const rawUniName = (
          body.universityName ||
          claimRecord?.university_name ||
          ""
        ).trim();
        const rawEmail = (
          claimRecord?.official_email ||
          body.officialEmail ||
          ""
        )
          .trim()
          .toLowerCase();
        const emailDomain = rawEmail.includes("@")
          ? rawEmail.split("@")[1].trim()
          : "";

        const normalizedSlug = SLUG_ALIAS_MAP[rawUniId] || rawUniId;
        const targetUserId =
          validUserId ||
          (isValidUuid(claimRecord?.user_id) ? claimRecord.user_id : null);

        const updateData: Record<string, any> = {
          claimed_status: "verified",
          updated_at: new Date().toISOString(),
        };
        if (targetUserId) {
          updateData.claimed_by_user_id = targetUserId;
        }

        // Strategy A: Update by normalized slug
        if (normalizedSlug) {
          const { data, error } = await supabaseAdmin
            .from("universities")
            .update(updateData)
            .eq("slug", normalizedSlug)
            .select();
          check(error, "Failed to link university by slug");

          if (
            (!data || data.length === 0) &&
            rawUniName &&
            claimRecord?.country_id
          ) {
            // University not in catalog yet: create a minimal, unfeatured entry
            // the claimant can fill in from the portal profile editor.
            const { error: insertError } = await supabaseAdmin
              .from("universities")
              .insert({
                name: rawUniName,
                slug: normalizedSlug,
                country_id: claimRecord.country_id,
                city: "",
                claimed_status: "verified",
                featured: false,
                official_email_domain: emailDomain || null,
                claimed_by_user_id: targetUserId,
              });
            check(insertError, "Failed to create university for claim");
          }
        }

        // Strategy B: Update by alias/raw id
        if (rawUniId && rawUniId !== normalizedSlug) {
          const { error } = await supabaseAdmin
            .from("universities")
            .update(updateData)
            .eq("slug", rawUniId);
          check(error, "Failed to link university by id");
        }

        // Strategy C: Update by official email domain
        if (emailDomain) {
          const { error } = await supabaseAdmin
            .from("universities")
            .update(updateData)
            .eq("official_email_domain", emailDomain);
          check(error, "Failed to link university by email domain");
        }

        // Strategy D: Update by exact (case-insensitive) name match
        if (rawUniName) {
          const { error } = await supabaseAdmin
            .from("universities")
            .update(updateData)
            .ilike("name", rawUniName.replace(/[\\%_]/g, "\\$&"));
          check(error, "Failed to link university by name");
        }

        // If user ID provided, upgrade user metadata role to university
        if (targetUserId) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(
            targetUserId,
            { user_metadata: { role: "university" } },
          );
          check(error, "Failed to grant university role");
        }
      }
    }

    return NextResponse.json({
      success: true,
      claimId,
      status: newStatus,
      message: `Claim ${newStatus} successfully!`,
    });
  } catch (err: any) {
    console.error("POST /api/claims/approve error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process claim request." },
      { status: 500 },
    );
  }
}
