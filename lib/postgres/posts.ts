import { pool } from "@/lib/postgres/connect";
import { Post, PostInsert } from "@/types/posts";

export async function upsertPost(post: PostInsert): Promise<Post> {
  const sql = `
    INSERT INTO posts (classification, category, slug)
    VALUES ($1, $2, $3)
    ON CONFLICT (classification, category, slug)
    DO UPDATE SET updated_at = NOW()
    RETURNING *;
  `;
  const values = [post.classification, post.category, post.slug];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

export async function getPosts(
  page: number,
  pageSize: number = 20,
): Promise<Post[]> {
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const offset = (page - 1) * safePageSize;
  const sql = `SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2;`;
  const result = await pool.query(sql, [safePageSize, offset]);
  return result.rows;
}

export async function getUnindexedPosts(
  page: number = 1,
  pageSize: number = 20,
): Promise<Post[]> {
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safePageSize;

  const sql = `SELECT * FROM posts WHERE indexed = false ORDER BY created_at DESC LIMIT $1 OFFSET $2;`;
  const result = await pool.query(sql, [safePageSize, offset]);
  return result.rows;
}

export async function markPostsAsIndexed(ids: string[]): Promise<Post[]> {
  const sql = `
    UPDATE posts
    SET indexed = true, updated_at = NOW()
    WHERE id = ANY($1::uuid[])
    RETURNING *;
  `;
  const result = await pool.query(sql, [ids]);
  return result.rows;
}
