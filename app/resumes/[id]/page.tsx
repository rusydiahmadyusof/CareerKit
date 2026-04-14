import { requireOnboardedUser } from "@/lib/auth/guards";
import { query } from "@/lib/db";
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
  const user = await requireOnboardedUser();

  const resumeRows = await query<Resume>("select * from resumes where id = $1 and user_id = $2 limit 1", [
    id,
    user.id,
  ]);
  const resume = resumeRows[0];

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
