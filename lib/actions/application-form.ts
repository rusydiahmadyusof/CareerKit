import type { ApplicationStatus } from "@/lib/types/database";

export type ParsedApplicationForm = {
  company: string;
  role: string;
  status: ApplicationStatus;
  jobUrl: string | null;
  appliedAt: string | null;
  notes: string | null;
  resumeId: string | null;
};

export function parseApplicationForm(formData: FormData): ParsedApplicationForm {
  const company = (formData.get("company") as string)?.trim() || "";
  const role = (formData.get("role") as string)?.trim() || "";
  const status = (formData.get("status") as ApplicationStatus) || "saved";
  const jobUrl = (formData.get("job_url") as string)?.trim() || null;
  const appliedAtRaw = (formData.get("applied_at") as string)?.trim() || null;
  const appliedAt = appliedAtRaw ? new Date(appliedAtRaw).toISOString() : null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const resumeId = (formData.get("resume_id") as string)?.trim() || null;

  return {
    company,
    role,
    status,
    jobUrl,
    appliedAt,
    notes,
    resumeId,
  };
}
