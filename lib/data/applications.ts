"use server";

import { query } from "@/lib/db";
import type { ApplicationStatus } from "@/lib/types/database";
import type { DbError } from "@/lib/data/shared";

export async function createApplicationForUser(
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
): Promise<DbError | null> {
  try {
    await query(
      "insert into applications (user_id, company, role, status, job_url, applied_at, notes, resume_id) values ($1,$2,$3,$4,$5,$6,$7,$8)",
      [userId, company, role, status, jobUrl, appliedAt, notes, resumeId]
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to create application." };
  }
}

export async function updateApplicationStatusForUser(
  { userId, applicationId, status }: { userId: string; applicationId: string; status: ApplicationStatus }
): Promise<DbError | null> {
  try {
    await query("update applications set status = $1, updated_at = now() where id = $2 and user_id = $3", [
      status,
      applicationId,
      userId,
    ]);
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update application." };
  }
}

export async function updateApplicationForUser(
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
): Promise<DbError | null> {
  try {
    await query(
      `update applications
       set company = $1, role = $2, status = $3, job_url = $4, applied_at = $5, notes = $6, resume_id = $7, updated_at = now()
       where id = $8 and user_id = $9`,
      [company, role, status, jobUrl, appliedAt, notes, resumeId, applicationId, userId]
    );
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to update application." };
  }
}

export async function deleteApplicationForUser(
  { userId, applicationId }: { userId: string; applicationId: string }
): Promise<DbError | null> {
  try {
    await query("delete from applications where id = $1 and user_id = $2", [applicationId, userId]);
    return null;
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Failed to delete application." };
  }
}

