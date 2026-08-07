import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove or move this.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Authorization check: verify the logged-in user has the admin role.
    // NOTE: middleware is a UX backstop for page navigation. The per-action
    // requireAdmin() calls in each server action are the authoritative gate,
    // since server actions can be invoked independently of page navigation.
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin !== true) {
      return NextResponse.redirect(
        new URL("/admin/login?error=forbidden", request.url)
      );
    }
  }

  // Only redirect a confirmed admin away from the login page.
  if (user && pathname === "/admin/login") {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin === true) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/callback"],
};
