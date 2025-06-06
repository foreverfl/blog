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

export async function getAllPosts(): Promise<Post[]> {
  const sql = `SELECT * FROM posts;`;
  const result = await pool.query(sql);
  return result.rows;
}

export async function getUnindexedPosts(): Promise<Post[]> {
  const sql = `SELECT * FROM posts WHERE indexed = false;`;
  const result = await pool.query(sql);
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
