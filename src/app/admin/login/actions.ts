"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) redirect("/admin/login?error=missing_fields");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/admin/login?error=invalid_credentials");
  redirect("/admin");
}
