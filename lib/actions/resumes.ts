"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ResumeContent } from "@/lib/types/database";
import {
  deleteResumeForUser,
  getResumeContentForUser,
  getResumeDetailsForUser,
  insertResumeForUser,
  insertResumeForUserAndReturnId,
  updateResumeAtsScoreForUser,
  updateResumeForUser,
  updateResumeInitialJobForUser,
} from "@/lib/data/resumes";

/** Returns the job title from a resume's basicInfo for the current user (e.g. to prefill application Role). */
export async function getResumeJobTitle(resumeId: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const id = resumeId?.trim();
  if (!id) return null;
  const content = await getResumeContentForUser(supabase, { userId: user.id, resumeId: id });
  const jobTitle = content?.basicInfo?.jobTitle;
  return typeof jobTitle === "string" && jobTitle.trim() ? jobTitle.trim() : null;
}
import {
  generateResumeContentFromJob,
  generateProfessionalSummary,
  generateSkillsFromContent,
  computeATSScore,
  refineResumeContentWithATSFeedback,
} from "@/lib/tailor-resume";
import { getProfile } from "@/lib/actions/profile";
import {
  profileToResumeContent,
  mergeProfileBasicInfo,
  mergeProfileExperienceAndEducation,
} from "@/lib/profile-to-resume";

export async function createResume(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (formData.get("name") as string)?.trim() || "Untitled Resume";
  const profile = await getProfile();
  const content = profileToResumeContent(profile);

  const error = await insertResumeForUser(supabase, {
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = data.name.trim() || "Untitled Resume";
  const error = await updateResumeForUser(supabase, {
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await updateResumeAtsScoreForUser(supabase, { userId: user.id, resumeId: id, score });
}

/** Save job title and description on a resume (e.g. after first ATS score from scratch). */
export async function updateResumeInitialJob(
  id: string,
  jobTitle: string,
  jobDescription: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await updateResumeInitialJobForUser(supabase, {
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
  return { error: "Could not generate summary. Check API keys (GROQ_API_KEY or OPENAI_API_KEY)." };
}

/** Regenerates skills list (5–8 high-level) from resume content; optional job context tailors it. */
export async function regenerateSkillsAction(
  content: ResumeContent,
  jobContext?: { jobTitle?: string; jobDescription?: string }
): Promise<{ skills?: Array<{ name?: string; category?: string }>; error?: string }> {
  const skills = await generateSkillsFromContent(content, jobContext);
  if (skills != null) return { skills };
  return { error: "Could not generate skills. Check API keys (GROQ_API_KEY or OPENAI_API_KEY)." };
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const desc = jobDescription?.trim();
  if (!desc) return { error: "Enter a job description to get an ATS score." };

  const content = await getResumeContentForUser(supabase, { userId: user.id, resumeId });
  if (!content) return { error: "Resume not found" };
  if (!content || typeof content !== "object") return { error: "Resume has no content." };

  const result = await computeATSScore(content, jobRole?.trim() || "Role", desc);
  if (!result) return { error: "Could not compute score. Check API keys (GROQ_API_KEY or OPENAI_API_KEY)." };
  return {
    score: result.score,
    feedback: result.feedback,
    ...(result.aspects && { aspects: result.aspects }),
  };
}

export async function duplicateResume(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const original = await getResumeDetailsForUser(supabase, { userId: user.id, resumeId: id });

  if (!original) {
    redirect("/resumes?error=" + encodeURIComponent("Resume not found"));
  }

  const name = (original.name?.trim() || "Untitled Resume") + " (Copy)";
  const insertError = await insertResumeForUser(supabase, {
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const error = await deleteResumeForUser(supabase, { userId: user.id, resumeId: id });
  if (error) return { error: error.message };

  redirect("/resumes");
}

export async function deleteResumeAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  if (id) await deleteResume(id);
}

export async function tailorResume(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobTitle = (formData.get("job-title") as string)?.trim() || "Untitled";
  const jobDescription = (formData.get("job-description") as string)?.trim() || "";
  const baseResumeId = (formData.get("base-resume") as string)?.trim();

  const name = `Resume – ${jobTitle}`;
  const profile = await getProfile();

  let baseContent: ResumeContent | null = null;
  let templateId = "default";

  if (baseResumeId && baseResumeId !== "scratch") {
    const original = await getResumeDetailsForUser(supabase, {
      userId: user.id,
      resumeId: baseResumeId,
    });

    if (!original) {
      redirect("/resumes/tailor?error=" + encodeURIComponent("Resume not found"));
    }

    templateId = original.template_id ?? "default";
    baseContent = original.content ?? {};
  } else {
    baseContent = profileToResumeContent(profile);
  }

  baseContent = mergeProfileExperienceAndEducation(baseContent ?? {}, profile);

  const generatedContent =
    jobDescription.trim() !== ""
      ? await generateResumeContentFromJob(jobTitle, jobDescription, baseContent ?? undefined)
      : null;

  let contentToUse: ResumeContent = generatedContent ?? baseContent ?? {};

  // Use ATS scoring to refine the generated resume when we have a job description
  if (jobDescription.trim() !== "" && contentToUse && Object.keys(contentToUse).length > 0) {
    const atsResult = await computeATSScore(contentToUse, jobTitle, jobDescription);
    if (atsResult?.feedback) {
      const refined = await refineResumeContentWithATSFeedback(
        contentToUse,
        jobTitle,
        jobDescription,
        atsResult.feedback
      );
      if (refined) contentToUse = refined;
    }
  }

  contentToUse = mergeProfileExperienceAndEducation(contentToUse, profile);
  contentToUse = mergeProfileBasicInfo(contentToUse, profile);

  const hasJobContext = jobDescription.trim() !== "";
  const { id: insertedId, error: insertError } = await insertResumeForUserAndReturnId(supabase, {
    userId: user.id,
    name,
    template_id: templateId,
    content: contentToUse,
    initial_job_title: hasJobContext ? jobTitle.trim() || null : undefined,
    initial_job_description: hasJobContext ? jobDescription.trim() || null : undefined,
  });

  if (insertError || !insertedId) {
    redirect("/resumes/tailor?error=" + encodeURIComponent(insertError?.message ?? "Insert failed"));
  }
  const applicationId = (formData.get("application_id") as string)?.trim();
  const resumeUrl = insertedId ? `/resumes/${insertedId}` : "/resumes";
  if (insertedId && applicationId) {
    redirect(`${resumeUrl}?application_id=${encodeURIComponent(applicationId)}`);
  }
  redirect(resumeUrl);
}
