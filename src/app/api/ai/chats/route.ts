import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, hasConfirmedEmail } from "@/lib/supabase/requestAuth";

/**
 * API Route: /api/ai/chats
 * Saves and lists AI Counsellor conversations (FR-AI-004).
 *
 * Who you are comes only from the bearer token, never from the request:
 *  - GET / DELETE need a signed-in user and only touch that user's chats.
 *  - POST works for guests too (keyed by the browser's random session id),
 *    but a chat that belongs to a user can only be updated by that user.
 */

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

/** True when the conversation row belongs to this signed-in user. */
function ownsConversation(row: any, user: User): boolean {
  return (
    (row.user_id && row.user_id === user.id) ||
    (!row.user_id &&
      !!row.user_email &&
      hasConfirmedEmail(user) &&
      row.user_email === user.email!.toLowerCase())
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) return fail("Please sign in", 401);
    const sessionId = new URL(req.url).searchParams.get("sessionId");

    if (sessionId) {
      const { data, error } = await supabaseAdmin
        .from("counsellor_conversations")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (error) return fail(error.message, 500);
      if (!data || !ownsConversation(data, user)) {
        return fail("Conversation not found", 404);
      }
      return NextResponse.json({ success: true, conversation: data });
    }

    // The signed-in user's own chats (by account id, or email for older rows)
    const filters = [`user_id.eq.${user.id}`];
    if (hasConfirmedEmail(user)) filters.push(`user_email.eq."${user.email!.toLowerCase()}"`);
    const { data, error } = await supabaseAdmin
      .from("counsellor_conversations")
      .select("*")
      .or(filters.join(","))
      .order("updated_at", { ascending: false })
      .limit(20);
    if (error) return fail(error.message, 500);

    return NextResponse.json({
      success: true,
      conversations: (data ?? []).filter((row) => ownsConversation(row, user)),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return fail(msg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    const body = await req.json();
    const {
      sessionId,
      title,
      pageContext = {},
      messages = [],
      leadLevel = 1,
      // Contact details a guest typed into the chat: kept with the chat for
      // follow-up, but never used as the account the chat belongs to
      leadEmail,
      leadName,
    } = body;

    if (
      typeof sessionId !== "string" ||
      sessionId.length < 16 ||
      sessionId.length > 128 ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 500
    ) {
      return fail("A valid sessionId and messages array are required", 400);
    }

    // Auto-generate a title from the first user message if not supplied
    let derivedTitle = typeof title === "string" && title ? title : "";
    if (!derivedTitle) {
      const firstUserMsg = messages.find((m: any) => m?.role === "user");
      derivedTitle =
        typeof firstUserMsg?.text === "string" && firstUserMsg.text
          ? firstUserMsg.text.length > 50
            ? firstUserMsg.text.substring(0, 47) + "..."
            : firstUserMsg.text
          : "Study Abroad Consultation";
    }

    const { data: existing } = await supabaseAdmin
      .from("counsellor_conversations")
      .select("id, user_id, user_email")
      .eq("session_id", sessionId)
      .maybeSingle();

    // Someone's chat can't be overwritten by a guest or another account
    const existingOwned = existing && (existing.user_id || existing.user_email);
    if (existingOwned && (!user || !ownsConversation(existing, user))) {
      return fail("This conversation belongs to another account", 403);
    }

    const payload = {
      session_id: sessionId,
      user_email: user?.email ? user.email.toLowerCase() : null,
      user_name:
        (user?.user_metadata?.name as string | undefined) ||
        (typeof leadName === "string" ? leadName.slice(0, 128) : null),
      user_id: user?.id ?? null,
      title: derivedTitle,
      page_context: {
        ...(typeof pageContext === "object" && pageContext ? pageContext : {}),
        ...(!user && typeof leadEmail === "string" ? { leadEmail } : {}),
      },
      messages,
      lead_level: Number(leadLevel) || 1,
      updated_at: new Date().toISOString(),
    };

    const query = existing?.id
      ? supabaseAdmin
          .from("counsellor_conversations")
          .update(payload)
          .eq("id", existing.id)
      : supabaseAdmin
          .from("counsellor_conversations")
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
    const { data, error } = await query.select().single();

    if (error) {
      console.warn("Could not save conversation:", error.message);
      return NextResponse.json({ success: true, saved: false });
    }
    return NextResponse.json({ success: true, saved: true, conversation: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return fail(msg, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) return fail("Please sign in", 401);
    const sessionId = new URL(req.url).searchParams.get("sessionId");
    if (!sessionId) return fail("sessionId is required", 400);

    const { data: row } = await supabaseAdmin
      .from("counsellor_conversations")
      .select("id, user_id, user_email")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (!row || !ownsConversation(row, user)) {
      return fail("Conversation not found", 404);
    }

    const { error } = await supabaseAdmin
      .from("counsellor_conversations")
      .delete()
      .eq("id", row.id);
    if (error) return fail(error.message, 500);

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return fail(msg, 500);
  }
}
