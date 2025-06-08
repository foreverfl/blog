import { pool } from "@/lib/postgres/connect";
import { CreateCommentInput, UpdateCommentInput } from "@/types/comments";

// create a comment
export async function createComment(
  input: CreateCommentInput,
): Promise<Comment> {
  const { post_id, user_id, user_photo, content } = input;
  const result = await pool.query<Comment>(
    `INSERT INTO comments (post_id, user_id, photo, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [post_id, user_id, user_photo, content],
  );
  return result.rows[0];
}

// fetch all comments for a specific post
export async function getCommentsForPost(post_id: string): Promise<Comment[]> {
  const result = await pool.query<Comment>(
    `
    SELECT
      c.id,
      u.email,
      u.username,
      u.photo,
      c.content,
      c.created_at AS "createdAt",
      c.reply,
      c.replied_at AS "repliedAt"
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
    `,
    [post_id],
  );
  return result.rows;
}

// update a comment
export async function updateComment(
  input: UpdateCommentInput,
): Promise<Comment | null> {
  const { id, content } = input;
  const result = await pool.query<Comment>(
    `UPDATE comments SET content = $1 WHERE id = $2 RETURNING *`,
    [content, id],
  );
  return result.rows[0] ?? null;
}

// add an admin reply to a comment
export async function upsertAdminReply(
  comment_id: string,
  reply: string,
): Promise<Comment | null> {
  const result = await pool.query<Comment>(
    `UPDATE comments SET reply = $1 WHERE id = $2 RETURNING *`,
    [reply, comment_id],
  );
  return result.rows[0] ?? null;
}

// delete an admin reply
export async function deleteAdminReply(
  comment_id: string,
): Promise<Comment | null> {
  const result = await pool.query<Comment>(
    `UPDATE comments SET reply = NULL WHERE id = $1 RETURNING *`,
    [comment_id],
  );
  return result.rows[0] ?? null;
}

// delete a comment
export async function deleteComment(
  id: string,
  user_id: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM comments WHERE id = $1 AND user_id = $2`,
    [id, user_id],
  );
  return (result.rowCount ?? 0) > 0;
}
