/**
 * Database table types.
 * Keep in sync with migration SQL files.
 */

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface ResumeBasicInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  website?: string;
  location?: string;
  linkedIn?: string;
}

export interface ResumeContent {
  basicInfo?: ResumeBasicInfo;
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  projects?: Array<{
    name?: string;
    url?: string;
    description?: string;
    tech?: string;
  }>;
  languages?: Array<{
    language?: string;
    level?: string;
  }>;
  skills?: Array<{ name?: string; category?: string }>;
}

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  template_id: string;
  content: ResumeContent;
  /** Job title used when creating via tailor; pre-fills ATS section */
  initial_job_title?: string | null;
  /** Job description used when creating via tailor; pre-fills ATS section */
  initial_job_description?: string | null;
  /** Last ATS score (0–100) for list card circle chart */
  last_ats_score?: number | null;
  /** SHA256 hash of `(jobRole + jobDescription)` used to cache last ATS feedback. */
  last_ats_job_hash?: string | null;
  /** Cached ATS feedback text for the last job-context hash. */
  last_ats_feedback?: string | null;
  /** Cached aspect scores (0–100) for the last job-context hash. */
  last_ats_aspects?: { keywords: number; experience: number; skills: number } | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  job_url: string | null;
  job_description: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  notes: string | null;
  resume_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ResumeInsert = Omit<Resume, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ResumeUpdate = Partial<Omit<Resume, "id" | "user_id" | "created_at">>;

export type ApplicationInsert = Omit<Application, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ApplicationUpdate = Partial<
  Omit<Application, "id" | "user_id" | "created_at">
>;

/** Profile: onboarding and editable user info (experience/education/skills match resume shape). */
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  summary: string | null;
  location?: string | null;
  experience?: ResumeContent["experience"];
  education?: ResumeContent["education"];
  certifications?: ResumeContent["certifications"];
  projects?: ResumeContent["projects"];
  languages?: ResumeContent["languages"];
  skills?: ResumeContent["skills"];
  onboarding_skipped_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "user_id" | "created_at">
>;
