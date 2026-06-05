import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Authorization gate for all admin server actions and pages.
 *
 * Uses the cookie-aware anon client so that `public.is_admin()` (a SECURITY
 * DEFINER function) evaluates against the currently logged-in user's
 * auth.uid() — not the service-role context.  This is the single source of
 * truth for "is this caller an admin", mirroring what the RLS policies use.
 *
 * Call this as the FIRST statement of every exported admin server action.
 * Middleware provides a UX backstop for page navigation, but server actions
 * can be invoked independently of page navigation, so this per-action check
 * is the authoritative server-side gate.
 *
 * On success, returns `{ user, supabase }` so callers can reuse the user
 * object (e.g. `user.email` for attribution) without an extra round-trip.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || isAdmin !== true) {
    // Best-effort sign-out so a non-admin session is cleared.
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore — the redirect is what matters.
    }
    redirect("/admin/login?error=forbidden");
  }

  return { user, supabase };
}
