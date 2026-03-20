"use server";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationStatus } from "@/lib/types/database";

export async function createApplicationForUser(
  supabase: SupabaseClient,
  {
    userId,
    company,
    role,
    status,
    jobUrl,
    appliedAt,
    notes,
    resumeId,
  }: {
    userId: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    jobUrl: string | null;
    appliedAt: string | null;
    notes: string | null;
    resumeId: string | null;
  }
): Promise<PostgrestError | null> {
  const { error } = await supabase.from("applications").insert({
    user_id: userId,
    company,
    role,
    status,
    job_url: jobUrl,
    applied_at: appliedAt,
    notes,
    resume_id: resumeId,
  });

  return error;
}

export async function updateApplicationStatusForUser(
  supabase: SupabaseClient,
  { userId, applicationId, status }: { userId: string; applicationId: string; status: ApplicationStatus }
): Promise<PostgrestError | null> {
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("user_id", userId);

  return error;
}

export async function updateApplicationForUser(
  supabase: SupabaseClient,
  {
    userId,
    applicationId,
    company,
    role,
    status,
    jobUrl,
    appliedAt,
    notes,
    resumeId,
  }: {
    userId: string;
    applicationId: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    jobUrl: string | null;
    appliedAt: string | null;
    notes: string | null;
    resumeId: string | null;
  }
): Promise<PostgrestError | null> {
  const { error } = await supabase
    .from("applications")
    .update({
      company,
      role,
      status,
      job_url: jobUrl,
      applied_at: appliedAt,
      notes,
      resume_id: resumeId,
    })
    .eq("id", applicationId)
    .eq("user_id", userId);

  return error;
}

export async function deleteApplicationForUser(
  supabase: SupabaseClient,
  { userId, applicationId }: { userId: string; applicationId: string }
): Promise<PostgrestError | null> {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId);

  return error;
}

