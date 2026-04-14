import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    await query("select 1");
    return NextResponse.json(
      { status: "ok", db: "ok", ts: new Date().toISOString() },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "error", ts: new Date().toISOString() },
      { status: 503 }
    );
  }
}
