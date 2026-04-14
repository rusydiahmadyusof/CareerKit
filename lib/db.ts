import { Pool, type QueryResultRow } from "pg";
import { logError } from "@/lib/observability/logger";

let pool: Pool | null = null;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL env var.");
  }
  return url;
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
) {
  try {
    const result = await getPool().query<T>(text, values);
    return result.rows;
  } catch (error) {
    logError("db.query.failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      query: text,
    });
    throw error;
  }
}
