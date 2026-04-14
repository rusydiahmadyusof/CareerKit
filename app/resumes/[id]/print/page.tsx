import { requireOnboardedUser } from "@/lib/auth/guards";
import { query } from "@/lib/db";
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
  const user = await requireOnboardedUser();

  const resumeRows = await query<{ name: string; content: ResumeContent; template_id: string }>(
    "select name, content, template_id from resumes where id = $1 and user_id = $2 limit 1",
    [id, user.id]
  );
  const resume = resumeRows[0];

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
