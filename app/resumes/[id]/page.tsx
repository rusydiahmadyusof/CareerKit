import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ResumeEditor } from "./resume-editor";
import type { Resume } from "@/lib/types/database";

export default async function ResumeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ application_id?: string }>;
}) {
  const { id } = await params;
  const { application_id } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) notFound();

  return (
    <div className="space-y-6">
      <ResumeEditor
        resume={resume as Resume}
        applicationId={application_id?.trim() ?? undefined}
      />
    </div>
  );
}
