"use server";

import { requireOnboardedUser } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import type { ApplicationStatus } from "@/lib/types/database";
import { parseApplicationForm } from "@/lib/actions/application-form";
import {
  createApplicationForUser,
  deleteApplicationForUser,
  updateApplicationForUser,
  updateApplicationStatusForUser,
} from "@/lib/data/applications";

export async function createApplication(formData: FormData) {
  const user = await requireOnboardedUser();
  const { company, role, status, jobUrl, appliedAt, notes, resumeId } = parseApplicationForm(formData);

  if (!company || !role) {
    redirect("/applications/new?error=" + encodeURIComponent("Company and role are required."));
  }

  const error = await createApplicationForUser({
    userId: user.id,
    company,
    role,
    status,
    jobUrl,
    appliedAt,
    notes,
    resumeId,
  });

  if (error) {
    redirect("/applications/new?error=" + encodeURIComponent(error.message));
  }

  redirect("/applications");
}

/** Update only the status of an application (e.g. from list row dropdown). Returns error message or empty. */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<{ error?: string }> {
  const user = await requireOnboardedUser();
  const error = await updateApplicationStatusForUser({ userId: user.id, applicationId: id, status });
  if (error) return { error: error.message };
  return {};
}

/** Server action for forms: pass formData with a hidden field name="id". */
export async function updateApplicationAction(formData: FormData) {
  const id = (formData.get("id") as string)?.trim();
  if (!id) redirect("/applications");
  return updateApplication(id, formData);
}

export async function updateApplication(id: string, formData: FormData) {
  const user = await requireOnboardedUser();
  const { company, role, status, jobUrl, appliedAt, notes, resumeId } = parseApplicationForm(formData);

  if (!company || !role) {
    redirect(
      "/applications/" +
        id +
        "?error=" +
        encodeURIComponent("Company and role are required.")
    );
  }

  const error = await updateApplicationForUser({
    userId: user.id,
    applicationId: id,
    company,
    role,
    status,
    jobUrl,
    appliedAt,
    notes,
    resumeId,
  });

  if (error) {
    redirect(
      "/applications/" +
        id +
        "?error=" +
        encodeURIComponent(error.message)
    );
  }

  redirect("/applications/" + id);
}

export async function deleteApplication(formData: FormData) {
  const user = await requireOnboardedUser();

  const id = (formData.get("id") as string)?.trim();
  if (!id) redirect("/applications");

  const error = await deleteApplicationForUser({ userId: user.id, applicationId: id });

  if (error) {
    redirect(
      "/applications/" + id + "?error=" + encodeURIComponent(error.message)
    );
  }

  redirect("/applications");
}
