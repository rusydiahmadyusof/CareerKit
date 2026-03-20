"use client";

import { useEffect } from "react";
import { getResumeJobTitle } from "@/lib/actions/resumes";

/** Sets default applied_at to now (when empty) and updates Role when user selects a linked resume. */
export function ApplicationFormEnhancements({
  defaultAppliedAt = "",
}: {
  /** For edit: existing applied_at in datetime-local format. For new: leave empty to default to now. */
  defaultAppliedAt?: string;
}) {
  useEffect(() => {
    const appliedAtEl = document.getElementById("applied_at") as HTMLInputElement | null;
    const resumeSelect = document.getElementById("resume_id") as HTMLSelectElement | null;
    const roleInput = document.getElementById("role") as HTMLInputElement | null;

    if (appliedAtEl) {
      const value = appliedAtEl.value?.trim();
      if (!value && defaultAppliedAt === "") {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        appliedAtEl.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      } else if (defaultAppliedAt && !value) {
        appliedAtEl.value = defaultAppliedAt;
      }
    }

    if (!resumeSelect || !roleInput) return;

    const handleResumeChange = async () => {
      const id = resumeSelect.value?.trim();
      if (!id) return;
      const jobTitle = await getResumeJobTitle(id);
      if (jobTitle != null) roleInput.value = jobTitle;
    };

    resumeSelect.addEventListener("change", handleResumeChange);
    return () => resumeSelect.removeEventListener("change", handleResumeChange);
  }, [defaultAppliedAt]);

  return null;
}
