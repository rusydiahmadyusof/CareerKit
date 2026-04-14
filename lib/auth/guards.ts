import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfileForUser } from "@/lib/data/profiles";

export async function requireAuthedUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireGuest() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
}

export async function requireOnboardedUser() {
  const user = await requireAuthedUser();
  const profile = await getProfileForUser({ userId: user.id });
  const isComplete = !!(profile?.full_name?.trim() || profile?.onboarding_skipped_at);
  if (!isComplete) {
    redirect("/onboarding");
  }
  return user;
}
