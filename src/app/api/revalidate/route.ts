import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * Called by a Supabase Database Webhook (or manually) to purge ISR cache for
 * coupon and store detail pages immediately after a status change in the DB.
 *
 * Authentication: Bearer token in the Authorization header must match the
 * REVALIDATE_SECRET environment variable.
 *
 * Supabase webhook body shape (sent by the "coupons" table UPDATE event):
 * {
 *   type: "UPDATE",
 *   table: "coupons",
 *   schema: "public",
 *   record: { slug: string, store_id: string, status: string, ... },
 *   old_record: { status: string, ... }
 * }
 *
 * The route also accepts a simpler direct format for manual / admin use:
 * { paths: string[] }  — array of Next.js paths to revalidate
 */

type SupabaseWebhookPayload = {
  type: string;
  table: string;
  schema: string;
  record: Record<string, unknown>;
  old_record: Record<string, unknown>;
};

type DirectPayload = {
  paths: string[];
};

export async function POST(req: NextRequest) {
  // --- Auth ---
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error("[revalidate] REVALIDATE_SECRET env var is not set");
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- Parse body ---
  let body: SupabaseWebhookPayload | DirectPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const revalidated: string[] = [];

  // --- Direct path list (manual / admin use) ---
  if ("paths" in body && Array.isArray(body.paths)) {
    for (const p of body.paths) {
      revalidatePath(p);
      revalidated.push(p);
    }
    return NextResponse.json({ revalidated });
  }

  // --- Supabase webhook format ---
  if ("record" in body && "old_record" in body) {
    const { record, old_record, table } = body as SupabaseWebhookPayload;

    if (table === "coupons") {
      const slug = record.slug as string | undefined;
      const newStatus = record.status as string | undefined;
      const oldStatus = old_record.status as string | undefined;

      // Always revalidate when any coupon field changes (covers expiry, edits, etc.)
      if (slug) {
        const couponPath = `/coupons/${slug}`;
        revalidatePath(couponPath);
        revalidated.push(couponPath);
      }

      // When a coupon expires, also bust the /coupons listing and the store page.
      // We don't have the store slug in the webhook payload directly, so we
      // revalidate the listing pages that aggregate this coupon.
      if (newStatus === "expired" && oldStatus !== "expired") {
        revalidatePath("/coupons");
        revalidated.push("/coupons");

        revalidatePath("/stores");
        revalidated.push("/stores");

        revalidatePath("/");
        revalidated.push("/");
      }
    }

    if (table === "stores") {
      const slug = record.slug as string | undefined;
      if (slug) {
        const storePath = `/stores/${slug}`;
        revalidatePath(storePath);
        revalidated.push(storePath);
      }
    }

    return NextResponse.json({ revalidated });
  }

  return NextResponse.json({ error: "unrecognized payload shape" }, { status: 400 });
}
