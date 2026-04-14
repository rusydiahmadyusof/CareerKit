import { query } from "@/lib/db";
import type { ApplicationStatus } from "@/lib/types/database";

function buildApplicationsWhere(status: string | null, search: string | null) {
  const clauses: string[] = ["a.user_id = $1"];
  const params: unknown[] = [];

  if (status) {
    clauses.push(`a.status = $${clauses.length + 1}`);
    params.push(status);
  }

  if (search) {
    clauses.push(`(a.company ilike $${clauses.length + 1} or a.role ilike $${clauses.length + 1})`);
    params.push(`%${search}%`);
  }

  return {
    whereSql: clauses.join(" and "),
    extraParams: params,
  };
}

export async function fetchApplicationsPageForUser(args: {
  userId: string;
  status: ApplicationStatus | null;
  search: string | null;
  page: number;
  pageSize: number;
}) {
  const { userId, status, search, page, pageSize } = args;
  const { whereSql, extraParams } = buildApplicationsWhere(status, search);
  const baseParams: unknown[] = [userId, ...extraParams];

  const countRows = await query<{ count: string }>(
    `select count(*)::text as count from applications a where ${whereSql}`,
    baseParams
  );
  const total = Number(countRows[0]?.count ?? 0);

  const listParams = [...baseParams, pageSize, (page - 1) * pageSize];
  const rows = await query<{
    id: string;
    company: string;
    role: string;
    status: string;
    applied_at: string | null;
    updated_at: string;
    resume_id: string | null;
    resume_name: string | null;
  }>(
    `select a.id, a.company, a.role, a.status, a.applied_at, a.updated_at, a.resume_id, r.name as resume_name
     from applications a
     left join resumes r on r.id = a.resume_id
     where ${whereSql}
     order by a.updated_at desc
     limit $${listParams.length - 1} offset $${listParams.length}`,
    listParams
  );

  return { total, rows };
}
