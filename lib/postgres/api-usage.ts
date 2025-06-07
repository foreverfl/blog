import { pool } from "@/lib/postgres/connect";

export async function ensureApiCountRow(apiName: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const sql = `
    INSERT INTO api_usage (date, api_name, count)
    VALUES ($1, $2, 0)
    ON CONFLICT (date, api_name) DO NOTHING;
  `;
  await pool.query(sql, [today, apiName]);
}

export async function incrementApiCount(apiName: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const sql = `
    INSERT INTO api_usage (date, api_name, count)
    VALUES ($1, $2, 1)
    ON CONFLICT (date, api_name)
    DO UPDATE SET count = api_usage.count + 1
    RETURNING count;
  `;
  const result = await pool.query(sql, [today, apiName]);
  return result.rows[0].count;
}

export async function getApiCount(apiName: string): Promise<number> {
  await ensureApiCountRow(apiName);
  const today = new Date().toISOString().slice(0, 10);
  const sql = `SELECT count FROM api_usage WHERE date = $1 AND api_name = $2;`;
  const result = await pool.query(sql, [today, apiName]);
  return result.rows[0]?.count ?? 0;
}
