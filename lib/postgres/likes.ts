import { pool } from "@/lib/postgres/connect";

export async function addLike(post_id: string, user_id: string): Promise<void> {
  const query = `
    INSERT INTO public.likes (post_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (post_id, user_id) DO NOTHING
  `;
  await pool.query(query, [post_id, user_id]);
}

export async function countLikes(post_id: string): Promise<number> {
  const query = `
    SELECT COUNT(*) AS like_count
    FROM public.likes
    WHERE post_id = $1
  `;
  const res = await pool.query(query, [post_id]);
  return parseInt(res.rows[0].like_count, 10);
}

export async function hasLiked(
  post_id: string,
  user_id: string,
): Promise<boolean> {
  const query = `
    SELECT 1
    FROM public.likes
    WHERE post_id = $1 AND user_id = $2
    LIMIT 1
  `;
  const res = await pool.query(query, [post_id, user_id]);
  return (res.rowCount ?? 0) > 0;
}

export async function removeLike(
  post_id: string,
  user_id: string,
): Promise<void> {
  const query = `
    DELETE FROM public.likes
    WHERE post_id = $1 AND user_id = $2
  `;
  await pool.query(query, [post_id, user_id]);
}
