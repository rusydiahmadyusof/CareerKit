"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function requestPasswordReset(formData: FormData): Promise<{ ok?: boolean; error?: string; resetLink?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Please enter your email." };

  const recentRequests = await query<{ count: string }>(
    `select count(*)::text as count
     from password_reset_tokens prt
     join app_users u on u.id = prt.user_id
     where u.email = $1 and prt.created_at > now() - interval '1 hour'`,
    [email]
  );
  if (Number(recentRequests[0]?.count ?? 0) >= 5) {
    return { error: "Too many reset requests. Please try again later." };
  }

  const users = await query<{ id: string }>("select id from app_users where email = $1 limit 1", [email]);
  if (users.length === 0) return { ok: true };

  const token = randomBytes(32).toString("hex");
  await query("delete from password_reset_tokens where user_id = $1 and used_at is null", [users[0].id]);
  await query(
    "insert into password_reset_tokens (token, user_id, expires_at) values ($1, $2, now() + interval '1 hour')",
    [token, users[0].id]
  );

  const resetLink = process.env.NODE_ENV === "production" ? undefined : `/reset-password?token=${token}`;
  return { ok: true, resetLink };
}

export async function resetPassword(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const token = (formData.get("token") as string)?.trim();
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirm_password") as string) ?? "";
  if (!token) return { error: "Invalid or expired reset link." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const tokenRows = await query<{ user_id: string }>(
    "select user_id from password_reset_tokens where token = $1 and used_at is null and expires_at > now() limit 1",
    [token]
  );
  if (tokenRows.length === 0) return { error: "Invalid or expired reset link." };

  const passwordHash = await bcrypt.hash(password, 10);
  await query("update app_users set password_hash = $1, updated_at = now() where id = $2", [
    passwordHash,
    tokenRows[0].user_id,
  ]);
  await query("update password_reset_tokens set used_at = now() where token = $1", [token]);
  await query("delete from app_sessions where user_id = $1", [tokenRows[0].user_id]);
  return { ok: true };
}
