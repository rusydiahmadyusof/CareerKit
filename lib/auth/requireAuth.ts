"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** Server-only auth gate for dashboard section layouts. */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return user;
}

