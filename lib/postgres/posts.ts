import { createHash } from "crypto";
import { pool } from "@/lib/postgres/connect";
import { Post } from "@/types/posts";

export function createPostUniqueId(date: string, title: string): string {
  const combined = `${date}-${title}`;
  return createHash("md5").update(combined).digest("hex");
}

export async function upsertPost(id: string): Promise<Post> {
  const sql = `
    INSERT INTO posts (id)
    VALUES ($1)
    ON CONFLICT (id) DO NOTHING
    RETURNING *;
  `;
  const result = await pool.query(sql, [id]);
  // 이미 존재해서 DO NOTHING이면 반환 row가 없으니, 기존 row를 조회해 리턴
  if (result.rows.length > 0) {
    return result.rows[0];
  } else {
    // 이미 있는 경우 select로 조회해서 반환
    const res = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    return res.rows[0];
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const sql = `SELECT * FROM posts;`;
  const result = await pool.query(sql);
  return result.rows;
}
