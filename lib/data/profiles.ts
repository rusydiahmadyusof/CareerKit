"use server";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Profile, ProfileUpdate } from "@/lib/types/database";

export async function getProfileForUser(
  supabase: SupabaseClient,
  { userId }: { userId: string }
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function upsertProfileForUser(
  supabase: SupabaseClient,
  {
    userId,
    data,
  }: {
    userId: string;
    data: ProfileUpdate;
  }
): Promise<PostgrestError | null> {
  const payload = {
    user_id: userId,
    full_name: data.full_name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    summary: data.summary ?? null,
    location: data.location ?? null,
    experience: data.experience ?? [],
    education: data.education ?? [],
    certifications: data.certifications ?? [],
    projects: data.projects ?? [],
    languages: data.languages ?? [],
    skills: data.skills ?? [],
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "user_id",
  });

  return error;
}

export async function skipOnboardingForUser(
  supabase: SupabaseClient,
  { userId }: { userId: string }
): Promise<PostgrestError | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_skipped_at: new Date().toISOString() })
      .eq("user_id", userId);
    return error;
  }

  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    onboarding_skipped_at: new Date().toISOString(),
  });
  return error;
}

