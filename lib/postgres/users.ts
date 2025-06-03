import { query } from "@/lib/postgres/connect";
import { User, UserCreateDTO, UserPublicDTO } from "@/types/users";

// 이메일로 존재하면 업데이트, 없으면 삽입
export async function upsertUser(userData: UserCreateDTO) {
  const sql = `
    INSERT INTO users (email, auth_provider, username, photo)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email)
    DO UPDATE SET
      auth_provider = EXCLUDED.auth_provider,
      username = EXCLUDED.username,
      photo = EXCLUDED.photo
    RETURNING *;
  `;
  const values = [
    userData.email,
    userData.auth_provider,
    userData.username,
    userData.photo ?? null,
  ];

  const result = await query(sql, values);
  return result.rows[0];
}

export async function getUsersInfoByIds(
  userIds: string[],
): Promise<UserPublicDTO[]> {
  if (!userIds.length) return [];
  const sql = `
    SELECT id, username, photo
    FROM users
    WHERE id = ANY($1)
  `;
  const result = await query(sql, [userIds]);
  return result.rows.map((row) => ({
    id: row.id,
    username: row.username,
    photo: row.photo,
  }));
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT * FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const result = await query(sql, [email]);
  return result.rows[0] ?? null;
}
