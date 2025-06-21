import { pool } from "@/lib/postgres/connect";
import type { VisitorFingerprint } from "@/types/fingerprint";

export async function upsertVisitorFingerprint(
  fingerprint: string,
  userAgent: string,
  ipAddress: string,
  country: string | null,
  isBot: boolean,
): Promise<void> {
  const query = `
    INSERT INTO visitor_fingerprint (fingerprint, user_agent, ip_address, country, is_bot)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (fingerprint)
    DO UPDATE SET
      last_visited = NOW(),
      visit_count = visitor_fingerprint.visit_count + 1,
      ip_address = $3,
      country = $4,
      is_bot = $5
  `;
  await pool.query(query, [fingerprint, userAgent, ipAddress, country, isBot]);
}

export async function getVisitorByFingerprint(
  fingerprint: string,
): Promise<VisitorFingerprint | null> {
  const query = `
    SELECT *
    FROM visitor_fingerprint
    WHERE fingerprint = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [fingerprint]);
  return rows[0] ?? null;
}
