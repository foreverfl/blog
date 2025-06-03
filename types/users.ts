export type User = {
  id: string; // uuid
  email: string;
  auth_provider: string;
  username: string;
  photo?: string | null;
  created_at?: string;
};

export type UserCreateDTO = Omit<User, "id" | "created_at">;
export type UserPublicDTO = Pick<User, "id" | "username" | "photo">;
