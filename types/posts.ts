export type Post = {
  id: string; // uuid (PK)
  classification: string;
  category: string;
  slug: string;
  body?: string;
  created_at: string;
  updated_at: string;
};

export type PostInsert = {
  classification: string;
  category: string;
  slug: string;
};
