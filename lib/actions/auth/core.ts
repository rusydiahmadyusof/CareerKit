"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { clearSession, createSession, getCurrentUser } from "@/lib/auth/session";
import { logInfo } from "@/lib/observability/logger";

const REMEMBER_EMAIL_COOKIE = "remember_email";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email?.trim() || !password) {
    return { error: "Email and password are required." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await query<{ id: string }>("select id from app_users where email = $1 limit 1", [
    normalizedEmail,
  ]);
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await query("insert into app_users (email, password_hash) values ($1, $2)", [normalizedEmail, passwordHash]);
  redirect("/login?registered=1");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email?.trim() || !password) {
    return { error: "Email and password are required." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = await query<{ id: string; password_hash: string }>(
    "select id, password_hash from app_users where email = $1 limit 1",
    [normalizedEmail]
  );
  const user = users[0];
  if (!user) {
    logInfo("auth.signin.failed", { email: normalizedEmail, reason: "user_not_found" });
    return { error: "Invalid email or password." };
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    logInfo("auth.signin.failed", { email: normalizedEmail, reason: "invalid_password" });
    return { error: "Invalid email or password." };
  }
  await createSession(user.id);
  logInfo("auth.signin.success", { userId: user.id });

  const cookieStore = await cookies();
  const rememberMe = formData.get("remember_me");
  if (rememberMe) {
    cookieStore.set(REMEMBER_EMAIL_COOKIE, email.trim(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
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
  const user = await getCurrentUser();
  await clearSession();
  if (user) {
    logInfo("auth.signout", { userId: user.id });
  }
  redirect("/");
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Not signed in." };
  }

  await query("delete from app_users where id = $1", [user.id]);
  await clearSession();
  redirect("/?deleted=1");
}
