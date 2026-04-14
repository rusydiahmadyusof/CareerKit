"use server";

import { query } from "@/lib/db";
import type { Profile, ProfileUpdate } from "@/lib/types/database";
import type { DbError } from "@/lib/data/shared";

export async function getProfileForUser(
  { userId }: { userId: string }
): Promise<Profile | null> {
  const rows = await query<Profile>("select * from profiles where user_id = $1 limit 1", [userId]);
  return rows[0] ?? null;
}

export async function upsertProfileForUser(
  {
    userId,
    data,
  }: {
    userId: string;
    data: ProfileUpdate;
  }
): Promise<DbError | null> {
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

  try {
    await query(
      `insert into profiles (
        user_id, full_name, email, phone, summary, location, experience, education, certifications, projects, languages, skills
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      on conflict (user_id) do update set
        full_name = excluded.full_name,
        email = excluded.email,
        phone = excluded.phone,
        summary = excluded.summary,
        location = excluded.location,
        experience = excluded.experience,
        education = excluded.education,
        certifications = excluded.certifications,
        projects = excluded.projects,
        languages = excluded.languages,
        skills = excluded.skills,
        updated_at = now()`,
      [
        payload.user_id,
        payload.full_name,
        payload.email,
        payload.phone,
        payload.summary,
        payload.location,
        JSON.stringify(payload.experience),
        JSON.stringify(payload.education),
        JSON.stringify(payload.certifications),
        JSON.stringify(payload.projects),
        JSON.stringify(payload.languages),
        JSON.stringify(payload.skills),
      ]
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update profile." };
  }
}

export async function skipOnboardingForUser(
  { userId }: { userId: string }
): Promise<DbError | null> {
  try {
    await query(
      `insert into profiles (user_id, onboarding_skipped_at)
       values ($1, now())
       on conflict (user_id) do update set onboarding_skipped_at = now(), updated_at = now()`,
      [userId]
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to skip onboarding." };
  }
}

