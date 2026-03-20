"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ApplicationStatus } from "@/lib/types/database";
import {
  createApplicationForUser,
  deleteApplicationForUser,
  updateApplicationForUser,
  updateApplicationStatusForUser,
} from "@/lib/data/applications";

export async function createApplication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company = (formData.get("company") as string)?.trim() || "";
  const role = (formData.get("role") as string)?.trim() || "";
  const status = (formData.get("status") as ApplicationStatus) || "saved";
  const jobUrl = (formData.get("job_url") as string)?.trim() || null;
  const appliedAtRaw = (formData.get("applied_at") as string)?.trim() || null;
  const appliedAt = appliedAtRaw ? new Date(appliedAtRaw).toISOString() : null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const resumeId = (formData.get("resume_id") as string)?.trim() || null;

  if (!company || !role) {
    redirect("/applications/new?error=" + encodeURIComponent("Company and role are required."));
  }

  const error = await createApplicationForUser(supabase, {
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const error = await updateApplicationStatusForUser(supabase, { userId: user.id, applicationId: id, status });
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company = (formData.get("company") as string)?.trim() || "";
  const role = (formData.get("role") as string)?.trim() || "";
  const status = (formData.get("status") as ApplicationStatus) || "saved";
  const jobUrl = (formData.get("job_url") as string)?.trim() || null;
  const appliedAtRaw = (formData.get("applied_at") as string)?.trim() || null;
  const appliedAt = appliedAtRaw ? new Date(appliedAtRaw).toISOString() : null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const resumeId = (formData.get("resume_id") as string)?.trim() || null;

  if (!company || !role) {
    redirect(
      "/applications/" +
        id +
        "?error=" +
        encodeURIComponent("Company and role are required.")
    );
  }

  const error = await updateApplicationForUser(supabase, {
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = (formData.get("id") as string)?.trim();
  if (!id) redirect("/applications");

  const error = await deleteApplicationForUser(supabase, { userId: user.id, applicationId: id });

  if (error) {
    redirect(
      "/applications/" + id + "?error=" + encodeURIComponent(error.message)
    );
  }

  redirect("/applications");
}
