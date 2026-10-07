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
