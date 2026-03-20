"use server";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { ResumeContent } from "@/lib/types/database";

type AuthedResumePayload = {
  userId: string;
};

export async function getResumeContentForUser(
  supabase: SupabaseClient,
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<ResumeContent | null> {
  const { data, error } = await supabase
    .from("resumes")
    .select("content")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return (data.content as ResumeContent) ?? null;
}

export async function getResumeDetailsForUser(
  supabase: SupabaseClient,
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<{ name: string; template_id: string; content: ResumeContent } | null> {
  const { data, error } = await supabase
    .from("resumes")
    .select("name, template_id, content")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return {
    name: data.name,
    template_id: data.template_id,
    content: (data.content as ResumeContent) ?? {},
  };
}

export async function updateResumeForUser(
  supabase: SupabaseClient,
  {
    userId,
    resumeId,
    name,
    template_id,
    content,
  }: AuthedResumePayload & {
    resumeId: string;
    name: string;
    template_id: string;
    content: ResumeContent;
  }
): Promise<PostgrestError | null> {
  const { error } = await supabase
    .from("resumes")
    .update({
      name,
      template_id,
      content,
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  return error;
}

export async function updateResumeAtsScoreForUser(
  supabase: SupabaseClient,
  { userId, resumeId, score }: AuthedResumePayload & { resumeId: string; score: number }
): Promise<PostgrestError | null> {
  const clamped = Math.round(Math.min(100, Math.max(0, score)));
  const { error } = await supabase
    .from("resumes")
    .update({ last_ats_score: clamped })
    .eq("id", resumeId)
    .eq("user_id", userId);

  return error;
}

export async function updateResumeInitialJobForUser(
  supabase: SupabaseClient,
  {
    userId,
    resumeId,
    jobTitle,
    jobDescription,
  }: AuthedResumePayload & { resumeId: string; jobTitle: string; jobDescription: string }
): Promise<PostgrestError | null> {
  const { error } = await supabase
    .from("resumes")
    .update({
      initial_job_title: jobTitle.trim() || null,
      initial_job_description: jobDescription.trim() || null,
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  return error;
}

export async function insertResumeForUser(
  supabase: SupabaseClient,
  {
    userId,
    name,
    template_id,
    content,
    initial_job_title,
    initial_job_description,
  }: AuthedResumePayload & {
    name: string;
    template_id: string;
    content: ResumeContent;
    initial_job_title?: string | null;
    initial_job_description?: string | null;
  }
): Promise<PostgrestError | null> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    name,
    template_id,
    content,
  };

  if (initial_job_title !== undefined) payload.initial_job_title = initial_job_title;
  if (initial_job_description !== undefined)
    payload.initial_job_description = initial_job_description;

  const { error } = await supabase.from("resumes").insert(payload);
  return error;
}

export async function insertResumeForUserAndReturnId(
  supabase: SupabaseClient,
  {
    userId,
    name,
    template_id,
    content,
    initial_job_title,
    initial_job_description,
  }: AuthedResumePayload & {
    name: string;
    template_id: string;
    content: ResumeContent;
    initial_job_title?: string | null;
    initial_job_description?: string | null;
  }
): Promise<{ id?: string; error: PostgrestError | null }> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    name,
    template_id,
    content,
  };

  if (initial_job_title !== undefined) payload.initial_job_title = initial_job_title;
  if (initial_job_description !== undefined)
    payload.initial_job_description = initial_job_description;

  const { data, error } = await supabase
    .from("resumes")
    .insert(payload)
    .select("id")
    .single();

  return { id: data?.id, error };
}

export async function deleteResumeForUser(
  supabase: SupabaseClient,
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<PostgrestError | null> {
  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", userId);

  return error;
}

export type ATSAspectsForDb = { keywords: number; experience: number; skills: number };

export async function getResumeAtsCacheForUser(
  supabase: SupabaseClient,
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<{
  last_ats_job_hash: string | null;
  last_ats_score: number | null;
  last_ats_feedback: string | null;
  last_ats_aspects: ATSAspectsForDb | null;
} | null> {
  const { data, error } = await supabase
    .from("resumes")
    .select("last_ats_job_hash, last_ats_score, last_ats_feedback, last_ats_aspects")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    last_ats_job_hash: data.last_ats_job_hash ?? null,
    last_ats_score: data.last_ats_score ?? null,
    last_ats_feedback: data.last_ats_feedback ?? null,
    last_ats_aspects: (data.last_ats_aspects as ATSAspectsForDb | null) ?? null,
  };
}

export async function updateResumeAtsResultForUser(
  supabase: SupabaseClient,
  {
    userId,
    resumeId,
    jobHash,
    score,
    feedback,
    aspects,
  }: AuthedResumePayload & {
    resumeId: string;
    jobHash: string;
    score: number;
    feedback: string;
    aspects?: ATSAspectsForDb | null;
  }
): Promise<PostgrestError | null> {
  const clamped = Math.round(Math.min(100, Math.max(0, score)));

  const { error } = await supabase
    .from("resumes")
    .update({
      last_ats_job_hash: jobHash,
      last_ats_score: clamped,
      last_ats_feedback: feedback,
      last_ats_aspects: aspects ?? null,
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  return error;
}

