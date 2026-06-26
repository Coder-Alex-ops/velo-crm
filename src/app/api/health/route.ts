import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars (without revealing values)
  checks.DATABASE_URL = process.env.DATABASE_URL
    ? `set (${process.env.DATABASE_URL.length} chars)`
    : "MISSING";
  checks.SESSION_SECRET = process.env.SESSION_SECRET
    ? `set (${process.env.SESSION_SECRET.length} chars, need ≥32)`
    : "MISSING";

  // Try DB connection
  try {
    const postgres = (await import("postgres")).default;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("No DATABASE_URL");
    const sql = postgres(connectionString, { prepare: false, max: 1, connect_timeout: 5 });
    await sql`select 1`;
    await sql.end();
    checks.db_connection = "ok";
  } catch (e: unknown) {
    checks.db_connection = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  const ok = Object.values(checks).every((v) => !v.startsWith("MISSING") && !v.startsWith("ERROR"));

  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 500 });
}
