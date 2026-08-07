"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils/slug";

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name_ar = formData.get("name_ar") as string;
  const name_en = (formData.get("name_en") as string) || null;
  const slug =
    (formData.get("slug") as string) || slugify(name_en || name_ar);
  const icon = (formData.get("icon") as string) || null;
  const display_order =
    parseInt(formData.get("display_order") as string) || 0;

  const { error } = await supabase.from("categories").insert({
    name_ar,
    name_en,
    slug,
    icon,
    display_order,
  });

  if (error) console.error("[createCategory]", error);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const name_ar = formData.get("name_ar") as string;
  const name_en = (formData.get("name_en") as string) || null;
  const slug =
    (formData.get("slug") as string) || slugify(name_en || name_ar);
  const icon = (formData.get("icon") as string) || null;
  const display_order =
    parseInt(formData.get("display_order") as string) || 0;
  // Editorial override fields. Empty → null so the public page falls back
  // to programmatic template output.
  const editorial_intro_ar =
    (formData.get("editorial_intro_ar") as string) || null;
  const seasonal_calendar_ar =
    (formData.get("seasonal_calendar_ar") as string) || null;
  const shopping_guide_ar =
    (formData.get("shopping_guide_ar") as string) || null;

  const { error } = await supabase
    .from("categories")
    .update({
      name_ar,
      name_en,
      slug,
      icon,
      display_order,
      editorial_intro_ar,
      seasonal_calendar_ar,
      shopping_guide_ar,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCategory]", error);
    redirect(`/admin/categories/${id}/edit?error=1`);
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) console.error("[deleteCategory]", error);

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
