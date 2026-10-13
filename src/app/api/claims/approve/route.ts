import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  getRequestUser,
  hasConfirmedEmail,
  isAdminUser,
} from "@/lib/supabase/requestAuth";

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
        return NextResponse.json(
          { error: "Claim not found." },
          { status: 404 },
        );
      }
      claimRecord = data;
    }

    // Never hand a university to an account that hasn't proved it owns its
    // email address (checked before anything is written)
    const claimantId =
      validUserId ||
      (isValidUuid(claimRecord?.user_id) ? claimRecord.user_id : null);
    if (newStatus === "approved" && claimantId) {
      const { data: claimant } =
        await supabaseAdmin.auth.admin.getUserById(claimantId);
      if (!hasConfirmedEmail(claimant?.user ?? null)) {
        return NextResponse.json(
          {
            error:
              "The claimant hasn't confirmed their account email yet, so the university can't be linked to it.",
          },
          { status: 409 },
        );
      }
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

        // Claims carry the university's slug, or its id when made from its page
        const uniIsUuid = isValidUuid(rawUniId);
        const normalizedSlug = uniIsUuid ? "" : rawUniId;
        const targetUserId = claimantId;

        const updateData: Record<string, any> = {
          claimed_status: "verified",
          updated_at: new Date().toISOString(),
        };
        if (targetUserId) {
          updateData.claimed_by_user_id = targetUserId;
        }

        // Link exactly ONE university to the claimant: the first match by
        // id, slug, official email domain, then exact name. Linking every
        // match (or creating a new row as well) gave one user several
        // universities, e.g. a duplicate of one they already owned.
        const findOne = async (
          column: "id" | "slug" | "official_email_domain" | "name",
          value: string,
        ): Promise<string | null> => {
          let query = supabaseAdmin.from("universities").select("id");
          query =
            column === "name"
              ? query.ilike("name", value.replace(/[\\%_]/g, "\\$&"))
              : query.eq(column, value);
          const { data, error } = await query.limit(1);
          check(error, `Failed to look up university by ${column}`);
          return data?.[0]?.id ?? null;
        };

        let matchedId: string | null = null;
        if (uniIsUuid) matchedId = await findOne("id", rawUniId);
        if (!matchedId && normalizedSlug) {
          matchedId = await findOne("slug", normalizedSlug);
        }
        if (!matchedId && emailDomain) {
          matchedId = await findOne("official_email_domain", emailDomain);
        }
        if (!matchedId && rawUniName)
          matchedId = await findOne("name", rawUniName);

        if (matchedId) {
          const { error } = await supabaseAdmin
            .from("universities")
            .update(updateData)
            .eq("id", matchedId);
          check(error, "Failed to link university");
        } else if (normalizedSlug && rawUniName && claimRecord?.country_id) {
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
