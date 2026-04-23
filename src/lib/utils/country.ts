import { cookies } from "next/headers";
import { COUNTRY_COOKIE, DEFAULT_COUNTRY } from "@/app/actions/country-constants";

/**
 * Reads the user's preferred country from the request cookie.
 * Falls back to SA if no preference has been set.
 * Must only be called inside server components/actions where `cookies()` is available.
 */
export async function getPreferredCountry(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(COUNTRY_COOKIE)?.value ?? DEFAULT_COUNTRY;
}
