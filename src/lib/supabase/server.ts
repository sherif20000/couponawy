import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies can't be mutated.
            // Middleware handles session refresh, so this is safe to swallow.
          }
        },
      },
    },
  );
}

// Admin client uses the service_role secret — bypasses RLS.
// Route handlers and server actions only. Never import from a client component.
// The SUPABASE_SERVICE_ROLE_KEY env var has no NEXT_PUBLIC_ prefix so Next.js
// will not expose it to the browser even if this file is transitively imported.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

// Public client uses the anon key but — crucially — does NOT touch cookies().
// Use this for Server Components that read public, RLS-protected data on
// detail/list pages (coupon/store/category routes).
//
// Why this exists: `createClient()` above reads cookies via next/headers, and
// any cookie access opts the route into dynamic rendering — even for routes
// that have `generateStaticParams` + `revalidate` set. That dynamic
// classification makes `dynamicParams = false` a no-op (Next.js can't enforce
// "only static params" on a route that's already rendering dynamically). The
// real-world bite: fake coupon slugs return HTTP 200 with the 404 page body
// (soft-404), which Google indexes as thin/duplicate content.
//
// With createPublicClient(), the detail routes are statically generated +
// ISR-revalidated, dynamicParams=false becomes enforceable, and Next.js
// returns proper HTTP 404 for unknown slugs.
//
// RLS is still active — anon key only sees rows the policies expose to
// public.role = 'anon'. Same data surface as createClient(), minus the
// auth-session attachment we don't need on these read-only public pages.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
