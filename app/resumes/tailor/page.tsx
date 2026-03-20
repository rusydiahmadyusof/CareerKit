import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TailorResumeForm } from "./tailor-resume-form";

export default async function TailorResumePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; application_id?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const { error, application_id } = params;

  let initialJobTitle = "";
  let initialJobDescription = "";

  if (application_id?.trim()) {
    const { data: application } = await supabase
      .from("applications")
      .select("role, notes")
      .eq("id", application_id.trim())
      .single();
    if (application) {
      initialJobTitle = application.role ?? "";
      initialJobDescription = application.notes ?? "";
    }
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, name")
    .order("updated_at", { ascending: false });

  return (
    <main className="flex-1 p-6" data-purpose="main-content-area">
      <div className="mx-auto max-w-[640px]">
        <header
          className="mb-6 flex items-start justify-between"
          data-purpose="page-header"
        >
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">
              Create resume
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Start from your profile, or add a job title and description to tailor content.
            </p>
          </div>
          <Link
            href="/resumes"
            className="py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            data-purpose="cancel-link"
          >
            Back
          </Link>
        </header>

        {error && (
          <p className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {decodeURIComponent(error)}
          </p>
        )}

        <div
          className="rounded-[8px] border bg-white p-6 shadow-sm"
          data-purpose="form-card"
        >
          <TailorResumeForm
            resumes={resumes ?? []}
            initialJobTitle={initialJobTitle}
            initialJobDescription={initialJobDescription}
            applicationId={application_id?.trim() ?? undefined}
          />
        </div>
      </div>
    </main>
  );
}
