import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ResumePreview } from "@/components/resume-preview";
import { PrintButton } from "./print-button";
import type { ResumeContent } from "@/lib/types/database";

export default async function ResumePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { id } = await params;
  const { template } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resume } = await supabase
    .from("resumes")
    .select("name, content, template_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) notFound();

  const content = (resume.content as ResumeContent) ?? {};
  const templateId = template ?? resume.template_id ?? "default";

  return (
    <div className="min-h-screen bg-muted/30 p-6 print:bg-white print:p-0 print:min-h-0">
      <PrintButton />
      <div className="mx-auto w-[210mm] min-h-[297mm] print:min-h-0 print:shadow-none bg-white">
        <ResumePreview content={content} templateId={templateId} forPrint />
      </div>
    </div>
  );
}
