import "server-only";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getRequestUser } from "@/lib/supabase/requestAuth";
import { getBuyerForUser } from "@/lib/buyerPortal";

export const jsonError = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

/**
 * The signed-in user and their buyer record, or an error response:
 * 401 when not signed in, 404 when the account has no buyer profile yet.
 */
export async function requireBuyer(
  request: Request,
): Promise<{ user: User; buyer: any } | { response: NextResponse }> {
  const user = await getRequestUser(request);
  if (!user) return { response: jsonError("Please sign in", 401) };
  const buyer = await getBuyerForUser(user);
  if (!buyer) {
    return {
      response: jsonError("No partner profile for this account. Complete partner onboarding first.", 404),
    };
  }
  return { user, buyer };
}
