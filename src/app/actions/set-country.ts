"use server";

import { cookies } from "next/headers";
import { COUNTRY_COOKIE } from "@/app/actions/country-constants";

/**
 * Persists the user's country preference in a long-lived cookie.
 * Called from the CountrySwitcher client component.
 */
export async function setPreferredCountry(code: string) {
  const cookieStore = await cookies();
  cookieStore.set(COUNTRY_COOKIE, code, {
    // 1 year
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    httpOnly: false, // readable by JS for optimistic UI
  });
}
