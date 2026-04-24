"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils/slug";

export async function createStore(formData: FormData) {
  const supabase = createAdminClient();

  const name_ar = formData.get("name_ar") as string;
  const name_en = (formData.get("name_en") as string) || name_ar;
  const slug =
    (formData.get("slug") as string) || slugify(name_en || name_ar);
  const logo_url = (formData.get("logo_url") as string) || null;
  const website_url = (formData.get("website_url") as string) || "https://example.com";
  const short_description_ar = (formData.get("short_description_ar") as string) || null;
  const description_ar = (formData.get("description_ar") as string) || null;
  const status = (formData.get("status") as "active" | "paused" | "archived") || "active";
  const is_featured = formData.get("is_featured") === "true";
  const is_verified = formData.get("is_verified") === "true";
  const display_order = parseInt(formData.get("display_order") as string) || 0;
  const meta_title = (formData.get("meta_title") as string) || null;
  const meta_description = (formData.get("meta_description") as string) || null;
  const og_image = (formData.get("og_image") as string) || null;
  const ratingRaw = formData.get("rating") as string;
  const rating = ratingRaw ? parseFloat(ratingRaw) : null;
  const reviewCountRaw = formData.get("review_count") as string;
  const review_count = reviewCountRaw ? parseInt(reviewCountRaw) : null;

  const { error } = await supabase.from("stores").insert({
    name_ar,
    name_en,
    slug,
    logo_url,
    website_url,
    short_description_ar,
    description_ar,
    status,
    is_featured,
    is_verified,
    display_order,
    meta_title,
    meta_description,
    og_image,
    rating,
    review_count,
  });

  if (error) {
    console.error("[createStore]", error);
    redirect("/admin/stores/new?error=1");
  }

  revalidatePath("/admin/stores");
  revalidatePath("/");
  redirect("/admin/stores");
}

export async function updateStore(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const name_ar = formData.get("name_ar") as string;
  const name_en = (formData.get("name_en") as string) || name_ar;
  const slug =
    (formData.get("slug") as string) || slugify(name_en || name_ar);
  const logo_url = (formData.get("logo_url") as string) || null;
  const website_url = (formData.get("website_url") as string) || undefined;
  const short_description_ar = (formData.get("short_description_ar") as string) || null;
  const description_ar = (formData.get("description_ar") as string) || null;
  const status = (formData.get("status") as "active" | "paused" | "archived") || "active";
  const is_featured = formData.get("is_featured") === "true";
  const is_verified = formData.get("is_verified") === "true";
  const display_order = parseInt(formData.get("display_order") as string) || 0;
  const meta_title = (formData.get("meta_title") as string) || null;
  const meta_description = (formData.get("meta_description") as string) || null;
  const og_image = (formData.get("og_image") as string) || null;
  const ratingRaw = formData.get("rating") as string;
  const rating = ratingRaw ? parseFloat(ratingRaw) : null;
  const reviewCountRaw = formData.get("review_count") as string;
  const review_count = reviewCountRaw ? parseInt(reviewCountRaw) : null;

  const { error } = await supabase
    .from("stores")
    .update({
      name_ar,
      name_en,
      slug,
      logo_url,
      website_url,
      short_description_ar,
      description_ar,
      status,
      is_featured,
      is_verified,
      display_order,
      meta_title,
      meta_description,
      og_image,
      rating,
      review_count,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateStore]", error);
    redirect(`/admin/stores/${id}/edit?error=1`);
  }

  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${id}/edit`);
  revalidatePath("/");
  revalidatePath(`/stores/${slug}`);
  redirect("/admin/stores");
}

export async function deleteStore(id: string) {
  const supabase = createAdminClient();

  // Fetch slug before deleting so we can revalidate the public detail page
  const { data: store } = await supabase
    .from("stores")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) console.error("[deleteStore]", error);

  revalidatePath("/admin/stores");
  revalidatePath("/");
  if (store?.slug) revalidatePath(`/stores/${store.slug}`);
}
