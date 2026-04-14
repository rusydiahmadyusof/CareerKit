"use server";

import { query } from "@/lib/db";
import type { ResumeContent } from "@/lib/types/database";
import type { DbError } from "@/lib/data/shared";

type AuthedResumePayload = {
  userId: string;
};

function buildInsertResumeArgs(payload: {
  user_id: string;
  name: string;
  template_id: string;
  content: ResumeContent;
  initial_job_title?: string | null;
  initial_job_description?: string | null;
}) {
  return [
    payload.user_id,
    payload.name,
    payload.template_id,
    JSON.stringify(payload.content),
    payload.initial_job_title ?? null,
    payload.initial_job_description ?? null,
  ];
}

export async function getResumeContentForUser(
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<ResumeContent | null> {
  const rows = await query<{ content: ResumeContent }>(
    "select content from resumes where id = $1 and user_id = $2 limit 1",
    [resumeId, userId]
  );
  return rows[0]?.content ?? null;
}

export async function getResumeDetailsForUser(
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<{ name: string; template_id: string; content: ResumeContent } | null> {
  const rows = await query<{ name: string; template_id: string; content: ResumeContent }>(
    "select name, template_id, content from resumes where id = $1 and user_id = $2 limit 1",
    [resumeId, userId]
  );
  const data = rows[0];
  if (!data) return null;
  return {
    name: data.name,
    template_id: data.template_id,
    content: (data.content as ResumeContent) ?? {},
  };
}

export async function updateResumeForUser(
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
): Promise<DbError | null> {
  try {
    await query(
      "update resumes set name = $1, template_id = $2, content = $3, updated_at = now() where id = $4 and user_id = $5",
      [name, template_id, JSON.stringify(content), resumeId, userId]
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update resume." };
  }
}

export async function updateResumeAtsScoreForUser(
  { userId, resumeId, score }: AuthedResumePayload & { resumeId: string; score: number }
): Promise<DbError | null> {
  const clamped = Math.round(Math.min(100, Math.max(0, score)));
  try {
    await query("update resumes set last_ats_score = $1, updated_at = now() where id = $2 and user_id = $3", [
      clamped,
      resumeId,
      userId,
    ]);
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update ATS score." };
  }
}

export async function updateResumeInitialJobForUser(
  {
    userId,
    resumeId,
    jobTitle,
    jobDescription,
  }: AuthedResumePayload & { resumeId: string; jobTitle: string; jobDescription: string }
): Promise<DbError | null> {
  try {
    await query(
      "update resumes set initial_job_title = $1, initial_job_description = $2, updated_at = now() where id = $3 and user_id = $4",
      [jobTitle.trim() || null, jobDescription.trim() || null, resumeId, userId]
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update job context." };
  }
}

export async function insertResumeForUser(
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
): Promise<DbError | null> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    name,
    template_id,
    content,
  };

  if (initial_job_title !== undefined) payload.initial_job_title = initial_job_title;
  if (initial_job_description !== undefined)
    payload.initial_job_description = initial_job_description;

  try {
    await query(
      `insert into resumes (user_id, name, template_id, content, initial_job_title, initial_job_description)
       values ($1, $2, $3, $4, $5, $6)`,
      buildInsertResumeArgs(payload as {
        user_id: string;
        name: string;
        template_id: string;
        content: ResumeContent;
        initial_job_title?: string | null;
        initial_job_description?: string | null;
      })
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to create resume." };
  }
}

export async function insertResumeForUserAndReturnId(
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
): Promise<{ id?: string; error: DbError | null }> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    name,
    template_id,
    content,
  };

  if (initial_job_title !== undefined) payload.initial_job_title = initial_job_title;
  if (initial_job_description !== undefined)
    payload.initial_job_description = initial_job_description;

  try {
    const rows = await query<{ id: string }>(
      `insert into resumes (user_id, name, template_id, content, initial_job_title, initial_job_description)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      buildInsertResumeArgs(payload as {
        user_id: string;
        name: string;
        template_id: string;
        content: ResumeContent;
        initial_job_title?: string | null;
        initial_job_description?: string | null;
      })
    );
    return { id: rows[0]?.id, error: null };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : "Failed to create resume." } };
  }
}

export async function deleteResumeForUser(
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<DbError | null> {
  try {
    await query("delete from resumes where id = $1 and user_id = $2", [resumeId, userId]);
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to delete resume." };
  }
}

export type ATSAspectsForDb = { keywords: number; experience: number; skills: number };

export async function getResumeAtsCacheForUser(
  { userId, resumeId }: AuthedResumePayload & { resumeId: string }
): Promise<{
  last_ats_job_hash: string | null;
  last_ats_score: number | null;
  last_ats_feedback: string | null;
  last_ats_aspects: ATSAspectsForDb | null;
} | null> {
  const rows = await query<{
    last_ats_job_hash: string | null;
    last_ats_score: number | null;
    last_ats_feedback: string | null;
    last_ats_aspects: ATSAspectsForDb | null;
  }>(
    "select last_ats_job_hash, last_ats_score, last_ats_feedback, last_ats_aspects from resumes where id = $1 and user_id = $2 limit 1",
    [resumeId, userId]
  );
  const data = rows[0];
  if (!data) return null;

  return {
    last_ats_job_hash: data.last_ats_job_hash ?? null,
    last_ats_score: data.last_ats_score ?? null,
    last_ats_feedback: data.last_ats_feedback ?? null,
    last_ats_aspects: (data.last_ats_aspects as ATSAspectsForDb | null) ?? null,
  };
}

export async function updateResumeAtsResultForUser(
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
): Promise<DbError | null> {
  const clamped = Math.round(Math.min(100, Math.max(0, score)));
  try {
    await query(
      `update resumes
       set last_ats_job_hash = $1,
           last_ats_score = $2,
           last_ats_feedback = $3,
           last_ats_aspects = $4,
           updated_at = now()
       where id = $5 and user_id = $6`,
      [jobHash, clamped, feedback, aspects ? JSON.stringify(aspects) : null, resumeId, userId]
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update ATS result." };
  }
}

