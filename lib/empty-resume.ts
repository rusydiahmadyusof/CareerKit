/**
 * Empty item factories for resume/profile content. Keeps shapes in sync with ResumeContent.
 */

import type { ResumeContent } from "@/lib/types/database";

export function emptyExperience() {
  return {
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

export function emptyEducation() {
  return {
    institution: "",
    degree: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

export function emptyCertification() {
  return { name: "", issuer: "", date: "", url: "" };
}

export function emptyProject() {
  return { name: "", url: "", description: "", tech: "" };
}

export function emptyLanguage() {
  return { language: "", level: "" };
}

/** Normalize content so all section arrays exist. */
export function ensureContent(c: ResumeContent | null | undefined): ResumeContent {
  if (!c || typeof c !== "object") return {};
  return {
    basicInfo: c.basicInfo ?? {},
    summary: c.summary ?? "",
    experience: Array.isArray(c.experience) ? c.experience : [],
    education: Array.isArray(c.education) ? c.education : [],
    certifications: Array.isArray(c.certifications) ? c.certifications : [],
    projects: Array.isArray(c.projects) ? c.projects : [],
    languages: Array.isArray(c.languages) ? c.languages : [],
    skills: Array.isArray(c.skills) ? c.skills : [],
  };
}
