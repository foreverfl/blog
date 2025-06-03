import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export { pool };

export const closePool = async () => {
  await pool.end();
};
