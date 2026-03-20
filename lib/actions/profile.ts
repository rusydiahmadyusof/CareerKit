"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile, ProfileUpdate } from "@/lib/types/database";
import { generateProfessionalSummaryFromProfile, generateSkillsFromProfile } from "@/lib/tailor-resume";
import { getProfileForUser, skipOnboardingForUser, upsertProfileForUser } from "@/lib/data/profiles";
import type { ActionResult } from "@/lib/actions/action-result";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return await getProfileForUser(supabase, { userId: user.id });
}

/** Returns true if profile exists and has full_name or user skipped onboarding. */
export async function isOnboardingComplete(): Promise<boolean> {
  const profile = await getProfile();
  return !!(profile?.full_name?.trim() || profile?.onboarding_skipped_at);
}

export async function upsertProfile(data: ProfileUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const error = await upsertProfileForUser(supabase, { userId: user.id, data });
  if (error) return { error: error.message };
  return {};
}

/** Call from client with full profile payload (e.g. after onboarding or profile edit). */
export async function saveProfile(data: ProfileUpdate): Promise<ActionResult> {
  const result = await upsertProfile(data);
  if (result.error) return result;
  return { ok: true as const };
}

/** Generate professional summary from profile experience; prioritizes most recent/current role. */
export async function generateProfileSummaryAction(profile: Pick<Profile, "experience" | "education" | "skills">) {
  const summary = await generateProfessionalSummaryFromProfile(profile);
  if (summary != null) return { summary };
  return { error: "Could not generate summary. Add experience first and check API keys (GROQ_API_KEY or OPENAI_API_KEY)." };
}

/** Generate skills from profile experience; prioritizes most recent/current role. */
export async function generateProfileSkillsAction(profile: Pick<Profile, "experience" | "education" | "skills">) {
  const skills = await generateSkillsFromProfile(profile);
  if (skills != null && skills.length > 0) return { skills: skills.map((s) => s.name ?? "").filter(Boolean) };
  return { error: "Could not generate skills. Add experience first and check API keys (GROQ_API_KEY or OPENAI_API_KEY)." };
}

/** Mark onboarding as skipped; user can fill profile later from Profile. */
export async function skipOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const error = await skipOnboardingForUser(supabase, { userId: user.id });
  if (error) redirect("/onboarding?error=" + encodeURIComponent(error.message));
  redirect("/dashboard");
}
