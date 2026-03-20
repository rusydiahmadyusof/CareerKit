"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const REMEMBER_EMAIL_COOKIE = "remember_email";

// Email confirmation is disabled in Supabase (Auth → Providers → Email).
// Re-enable later when adding confirmation flow.

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email?.trim() || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signUp({ email: email.trim(), password });

  if (error) {
    return { error: error.message };
  }

  // Sign out so user lands on login as unauthenticated (then they sign in to reach dashboard).
  await supabase.auth.signOut();
  redirect("/login?registered=1");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email?.trim() || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const cookieStore = await cookies();
  const rememberMe = formData.get("remember_me");
  if (rememberMe) {
    cookieStore.set(REMEMBER_EMAIL_COOKIE, email.trim(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    cookieStore.delete(REMEMBER_EMAIL_COOKIE);
  }

  redirect("/dashboard?welcome=login");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Delete the current user's account and all their data.
 * Requires SUPABASE_SERVICE_ROLE_KEY for full auth user deletion; otherwise only app data is removed.
 */
export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not signed in." };
  }

  const userId = user.id;

  // Delete app data (RLS allows user to delete own rows)
  await supabase.from("profiles").delete().eq("user_id", userId);
  await supabase.from("applications").delete().eq("user_id", userId);
  await supabase.from("resumes").delete().eq("user_id", userId);

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      return { error: error.message };
    }
  }
  // If no admin client (no SUPABASE_SERVICE_ROLE_KEY), auth user remains but app data is gone
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
