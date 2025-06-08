export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_photo?: string | null;
  content: string;
  reply?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FullComment extends Comment {
  email: string;
  username: string;
  user_photo: string | null;
}

export interface CreateCommentInput {
  post_id: string;
  user_id: string;
  content: string;
  user_photo?: string | null;
}

export interface UpdateCommentInput {
  id: string;
  content?: string;
  reply?: string | null;
  replied_at?: string | null;
  user_photo?: string | null;
}
