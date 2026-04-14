"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { requireOnboardedUser } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import type { ResumeContent } from "@/lib/types/database";
import { getAtsJobContextHash } from "@/lib/ats-hash";
import {
  deleteResumeForUser,
  getResumeContentForUser,
  getResumeDetailsForUser,
  getResumeAtsCacheForUser,
  insertResumeForUser,
  insertResumeForUserAndReturnId,
  updateResumeAtsScoreForUser,
  updateResumeForUser,
  updateResumeInitialJobForUser,
  updateResumeAtsResultForUser,
} from "@/lib/data/resumes";
import { runTailorResumeWorkflow } from "@/lib/services/tailor-resume-workflow";

/** Returns the job title from a resume's basicInfo for the current user (e.g. to prefill application Role). */
export async function getResumeJobTitle(resumeId: string): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const id = resumeId?.trim();
  if (!id) return null;
  const content = await getResumeContentForUser({ userId: user.id, resumeId: id });
  const jobTitle = content?.basicInfo?.jobTitle;
  return typeof jobTitle === "string" && jobTitle.trim() ? jobTitle.trim() : null;
}
import {
  generateProfessionalSummary,
  generateSkillsFromContent,
  computeATSScore,
  getAiUserSafeError,
} from "@/lib/tailor-resume";
import { getProfile } from "@/lib/actions/profile";
import { profileToResumeContent } from "@/lib/profile-to-resume";

export async function createResume(formData: FormData) {
  const user = await requireOnboardedUser();

  const name = (formData.get("name") as string)?.trim() || "Untitled Resume";
  const profile = await getProfile();
  const content = profileToResumeContent(profile);

  const error = await insertResumeForUser({
    userId: user.id,
    name,
    template_id: "default",
    content,
  });

  if (error) {
    redirect("/resumes/tailor?error=" + encodeURIComponent(error.message));
  }

  redirect("/resumes");
}

export async function updateResume(
  id: string,
  data: { name: string; template_id: string; content: ResumeContent },
  applicationId?: string
) {
  const user = await requireOnboardedUser();

  const name = data.name.trim() || "Untitled Resume";
  const error = await updateResumeForUser({
    userId: user.id,
    resumeId: id,
    name,
    template_id: data.template_id,
    content: data.content,
  });

  if (error) {
    return { error: error.message };
  }

  if (applicationId?.trim()) {
    return {
      redirectTo: `/applications/${applicationId.trim()}?resume_id=${encodeURIComponent(id)}`,
    };
  }
  return { redirectTo: "/resumes/" + id };
}

/** Persist last ATS score so the resume list can show it in the circle chart. */
export async function updateResumeAtsScore(id: string, score: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await updateResumeAtsScoreForUser({ userId: user.id, resumeId: id, score });
}

/** Save job title and description on a resume (e.g. after first ATS score from scratch). */
export async function updateResumeInitialJob(
  id: string,
  jobTitle: string,
  jobDescription: string
) {
  const user = await getCurrentUser();
  if (!user) return;
  await updateResumeInitialJobForUser({
    userId: user.id,
    resumeId: id,
    jobTitle,
    jobDescription,
  });
}

/** Regenerates professional summary from current resume content; optional job context tailors it. */
export async function regenerateProfessionalSummaryAction(
  content: ResumeContent,
  jobContext?: { jobTitle?: string; jobDescription?: string }
): Promise<{ summary?: string; error?: string }> {
  const summary = await generateProfessionalSummary(content, jobContext);
  if (summary != null) return { summary };
  return { error: getAiUserSafeError("generateProfessionalSummary") };
}

/** Regenerates skills list (5–8 high-level) from resume content; optional job context tailors it. */
export async function regenerateSkillsAction(
  content: ResumeContent,
  jobContext?: { jobTitle?: string; jobDescription?: string }
): Promise<{ skills?: Array<{ name?: string; category?: string }>; error?: string }> {
  const skills = await generateSkillsFromContent(content, jobContext);
  if (skills != null) return { skills };
  return { error: getAiUserSafeError("generateSkillsFromContent") };
}

/** ATS result with optional per-aspect scores for the summary. */
export type ATSScoreResponse =
  | { score: number; feedback: string; aspects?: { keywords: number; experience: number; skills: number } }
  | { error: string };

/** Returns ATS score (0–100), feedback, and aspect scores for this resume vs the given job. Uses saved resume content. */
export async function getATSScoreForResume(
  resumeId: string,
  jobRole: string,
  jobDescription: string
): Promise<ATSScoreResponse> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const jobRoleTrimmed = jobRole?.trim() || "Role";
  const desc = jobDescription?.trim();
  if (!desc) return { error: "Enter a job description to get an ATS score." };

  const jobHash = getAtsJobContextHash(jobRoleTrimmed, desc);

  const cached = await getResumeAtsCacheForUser({ userId: user.id, resumeId });
  if (
    cached &&
    cached.last_ats_job_hash === jobHash &&
    typeof cached.last_ats_score === "number" &&
    cached.last_ats_feedback
  ) {
    return {
      score: cached.last_ats_score,
      feedback: cached.last_ats_feedback,
      ...(cached.last_ats_aspects && { aspects: cached.last_ats_aspects }),
    };
  }

  const content = await getResumeContentForUser({ userId: user.id, resumeId });
  if (!content) return { error: "Resume not found" };
  if (!content || typeof content !== "object") return { error: "Resume has no content." };

  const result = await computeATSScore(content, jobRoleTrimmed, desc);
  if (!result) return { error: getAiUserSafeError("computeATSScore") };

  await updateResumeAtsResultForUser({
    userId: user.id,
    resumeId,
    jobHash,
    score: result.score,
    feedback: result.feedback,
    aspects: result.aspects ?? null,
  });

  return {
    score: result.score,
    feedback: result.feedback,
    ...(result.aspects && { aspects: result.aspects }),
  };
}

export async function duplicateResume(id: string) {
  const user = await requireOnboardedUser();

  const original = await getResumeDetailsForUser({ userId: user.id, resumeId: id });

  if (!original) {
    redirect("/resumes?error=" + encodeURIComponent("Resume not found"));
  }

  const name = (original.name?.trim() || "Untitled Resume") + " (Copy)";
  const insertError = await insertResumeForUser({
    userId: user.id,
    name,
    template_id: original.template_id ?? "default",
    content: original.content ?? {},
  });

  if (insertError) {
    redirect("/resumes?error=" + encodeURIComponent(insertError.message));
  }

  redirect("/resumes");
}

export async function duplicateResumeAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  if (id) await duplicateResume(id);
}

export async function deleteResume(id: string) {
  const user = await requireOnboardedUser();

  const error = await deleteResumeForUser({ userId: user.id, resumeId: id });
  if (error) return { error: error.message };

  redirect("/resumes");
}

export async function deleteResumeAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  if (id) await deleteResume(id);
}

export async function tailorResume(formData: FormData) {
  const user = await requireOnboardedUser();

  const jobTitle = (formData.get("job-title") as string)?.trim() || "Untitled";
  const jobDescription = (formData.get("job-description") as string)?.trim() || "";
  const baseResumeId = (formData.get("base-resume") as string)?.trim();

  const profile = await getProfile();
  const workflowResult = await runTailorResumeWorkflow({
    userId: user.id,
    jobTitle,
    jobDescription,
    baseResumeId,
    profile,
  });

  if (workflowResult.error) {
    redirect("/resumes/tailor?error=" + encodeURIComponent(workflowResult.error));
  }

  const insertedId = workflowResult.insertedId;
  const applicationId = (formData.get("application_id") as string)?.trim();
  const resumeUrl = insertedId ? `/resumes/${insertedId}` : "/resumes";
  if (insertedId && applicationId) {
    redirect(`${resumeUrl}?application_id=${encodeURIComponent(applicationId)}`);
  }
  redirect(resumeUrl);
}
