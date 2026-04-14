import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

const SESSION_COOKIE = "careerkit_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  email: string;
};

function sessionToken() {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string) {
  const token = sessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await query(
    "insert into app_sessions (token, user_id, expires_at) values ($1, $2, $3)",
    [token, userId, expiresAt.toISOString()]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("delete from app_sessions where token = $1", [token]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await query<SessionUser>(
    `select u.id, u.email
     from app_sessions s
     join app_users u on u.id = s.user_id
     where s.token = $1 and s.expires_at > now()
     limit 1`,
    [token]
  );

  const user = rows[0] ?? null;
  if (!user) {
    // Stale/invalid cookie cleanup
    await query("delete from app_sessions where token = $1", [token]);
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
  return user;
}
