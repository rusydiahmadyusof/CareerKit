import type { Profile, ResumeContent } from "@/lib/types/database";

/** Build ResumeContent from profile for use as base in tailor or pre-fill. */
export function profileToResumeContent(profile: Profile | null): ResumeContent {
  if (!profile) return {};
  return {
    basicInfo: {
      fullName: profile.full_name ?? undefined,
      email: profile.email ?? undefined,
      phone: profile.phone ?? undefined,
      jobTitle: undefined,
      website: undefined,
      location: profile.location ?? undefined,
    },
    summary: profile.summary ?? undefined,
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    education: Array.isArray(profile.education) ? profile.education : [],
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    projects: Array.isArray(profile.projects) ? profile.projects : [],
    languages: Array.isArray(profile.languages) ? profile.languages : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
  };
}

/** Overlay profile name/email/phone onto content.basicInfo so contact info is always from profile when present. */
export function mergeProfileBasicInfo(
  content: ResumeContent,
  profile: Profile | null
): ResumeContent {
  if (!profile) return content;
  const basicInfo = {
    ...content.basicInfo,
    fullName: profile.full_name?.trim() || content.basicInfo?.fullName,
    email: profile.email?.trim() || content.basicInfo?.email,
    phone: profile.phone?.trim() || content.basicInfo?.phone,
    location: profile.location?.trim() || content.basicInfo?.location,
  };
  return { ...content, basicInfo };
}

/** Overlay profile experience, education, certifications, projects, languages onto content. */
export function mergeProfileExperienceAndEducation(
  content: ResumeContent,
  profile: Profile | null
): ResumeContent {
  if (!profile) return content;
  const experience = Array.isArray(profile.experience) && profile.experience.length > 0
    ? profile.experience
    : content.experience;
  const education = Array.isArray(profile.education) && profile.education.length > 0
    ? profile.education
    : content.education;
  const certifications = Array.isArray(profile.certifications) && profile.certifications.length > 0
    ? profile.certifications
    : content.certifications;
  const projects = Array.isArray(profile.projects) && profile.projects.length > 0
    ? profile.projects
    : content.projects;
  const languages = Array.isArray(profile.languages) && profile.languages.length > 0
    ? profile.languages
    : content.languages;
  return {
    ...content,
    experience: experience ?? [],
    education: education ?? [],
    certifications: certifications ?? [],
    projects: projects ?? [],
    languages: languages ?? [],
  };
}
