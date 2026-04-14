import type { ResumeContent } from "@/lib/types/database";
import type { Profile } from "@/lib/types/database";
import { getAtsJobContextHash } from "@/lib/ats-hash";
import {
  getResumeDetailsForUser,
  insertResumeForUserAndReturnId,
  updateResumeAtsResultForUser,
} from "@/lib/data/resumes";
import {
  computeATSScore,
  generateResumeContentFromJob,
  refineResumeContentWithATSFeedback,
} from "@/lib/tailor-resume";
import {
  profileToResumeContent,
  mergeProfileBasicInfo,
  mergeProfileExperienceAndEducation,
} from "@/lib/profile-to-resume";

type TailorArgs = {
  userId: string;
  jobTitle: string;
  jobDescription: string;
  baseResumeId?: string;
  profile: Profile | null;
};

export async function runTailorResumeWorkflow(args: TailorArgs) {
  const { userId, jobTitle, jobDescription, baseResumeId, profile } = args;
  const name = `Resume – ${jobTitle}`;
  let baseContent: ResumeContent | null = null;
  let templateId = "default";
  let atsResultForFeedback: Awaited<ReturnType<typeof computeATSScore>> | null = null;
  let atsResultForCache: Awaited<ReturnType<typeof computeATSScore>> | null = null;

  if (baseResumeId && baseResumeId !== "scratch") {
    const original = await getResumeDetailsForUser({
      userId,
      resumeId: baseResumeId,
    });
    if (!original) {
      return { error: "Resume not found" };
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

  if (jobDescription.length >= 80 && Object.keys(contentToUse).length > 0) {
    atsResultForFeedback = await computeATSScore(contentToUse, jobTitle, jobDescription);
    if (atsResultForFeedback?.feedback) {
      const refined = await refineResumeContentWithATSFeedback(
        contentToUse,
        jobTitle,
        jobDescription,
        atsResultForFeedback.feedback
      );
      if (refined) contentToUse = refined;
    }
  }

  contentToUse = mergeProfileExperienceAndEducation(contentToUse, profile);
  contentToUse = mergeProfileBasicInfo(contentToUse, profile);

  const hasJobContext = jobDescription.trim() !== "";
  const shouldComputeAts = jobDescription.length >= 80;

  if (shouldComputeAts && Object.keys(contentToUse).length > 0) {
    atsResultForCache = await computeATSScore(contentToUse, jobTitle, jobDescription);
  }

  const { id: insertedId, error: insertError } = await insertResumeForUserAndReturnId({
    userId,
    name,
    template_id: templateId,
    content: contentToUse,
    initial_job_title: hasJobContext ? jobTitle.trim() || null : undefined,
    initial_job_description: hasJobContext ? jobDescription.trim() || null : undefined,
  });

  if (insertError || !insertedId) {
    return { error: insertError?.message ?? "Insert failed" };
  }

  if (atsResultForCache?.feedback) {
    const jobHash = getAtsJobContextHash(jobTitle, jobDescription);
    await updateResumeAtsResultForUser({
      userId,
      resumeId: insertedId,
      jobHash,
      score: atsResultForCache.score,
      feedback: atsResultForCache.feedback,
      aspects: atsResultForCache.aspects ?? null,
    });
  }

  return { insertedId, error: null as string | null };
}
