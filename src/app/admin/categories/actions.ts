"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils/slug";

export async function createCategory(formData: FormData) {
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
  const supabase = createAdminClient();

  const name_ar = formData.get("name_ar") as string;
  const name_en = (formData.get("name_en") as string) || null;
  const slug =
    (formData.get("slug") as string) || slugify(name_en || name_ar);
  const icon = (formData.get("icon") as string) || null;
  const display_order =
    parseInt(formData.get("display_order") as string) || 0;

  const { error } = await supabase
    .from("categories")
    .update({ name_ar, name_en, slug, icon, display_order })
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
  const supabase = createAdminClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) console.error("[deleteCategory]", error);

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
