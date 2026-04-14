"use server";

import { requireAuthedUser } from "@/lib/auth/guards";

/** Server-only auth gate for dashboard section layouts. */
export async function requireAuth() {
  return requireAuthedUser();
}

