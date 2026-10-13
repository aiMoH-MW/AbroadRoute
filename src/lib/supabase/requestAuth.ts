import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "./server";

// Resolves the Supabase user from an `Authorization: Bearer <access_token>` header.
export async function getRequestUser(request: Request): Promise<User | null> {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  return error ? null : user;
}

// app_metadata is server-controlled; user_metadata is writable by the user
export function isAdminUser(user: User | null): boolean {
  return user?.app_metadata?.role === "admin";
}

/**
 * Guard for admin API handlers: returns a 401/403 response to send back,
 * or null when the request comes from a signed-in admin.
 *   const denied = await requireAdmin(req); if (denied) return denied;
 */
export async function requireAdmin(request: Request): Promise<Response | null> {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json(
      { success: false, error: "Please sign in" },
      { status: 401 },
    );
  }
  if (!isAdminUser(user)) {
    return Response.json(
      { success: false, error: "Admin access required" },
      { status: 403 },
    );
  }
  return null;
}

/**
 * True when the user has proved they own their email address. Anything that
 * grants access based on an email (buyer profiles, inquiries, claims, older
 * chats) must check this, or an account registered with someone else's
 * address could take over what belongs to that address.
 */
export function hasConfirmedEmail(user: User | null): boolean {
  return Boolean(user?.email && user.email_confirmed_at);
}
