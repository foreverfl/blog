-- ============================================
-- Database Schema Initialization
-- ============================================
-- This script creates all tables for the blog application
-- Run order: 01-schema.sql -> 02-indexes.sql -> 03-triggers.sql (if exists)

-- ============================================
-- Table: visitor_fingerprint
-- Description: Stores visitor fingerprint data for analytics
-- ============================================
CREATE TABLE IF NOT EXISTS public.visitor_fingerprint (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fingerprint varchar(128) NOT NULL,
    user_agent text NULL,
    ip_address varchar(64) NULL,
    country varchar(8) NULL,
    is_bot bool DEFAULT false NULL,
    first_visited timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul'::text) NULL,
    last_visited timestamptz DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul'::text) NULL,
    visit_count int4 DEFAULT 1 NULL,
    CONSTRAINT visitor_fingerprint_fingerprint_key UNIQUE (fingerprint),
    CONSTRAINT visitor_fingerprint_pkey PRIMARY KEY (id)
);

-- ============================================
-- Table: users
-- Description: Stores user information for authentication
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email varchar(255) NOT NULL,
    auth_provider varchar(32) NOT NULL,
    username varchar(64) NOT NULL,
    photo text NULL,
    created_at timestamptz DEFAULT now() NULL,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- ============================================
-- Table: posts
-- Description: Stores blog post content and metadata
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    classification text DEFAULT ''::text NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    slug text DEFAULT ''::text NOT NULL,
    body text NULL,
    created_at timestamp DEFAULT now() NULL,
    updated_at timestamp DEFAULT now() NULL,
    indexed bool DEFAULT false NOT NULL,
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT unique_post_key UNIQUE (classification, category, slug)
);

-- ============================================
-- Table: likes
-- Description: Stores user likes on posts (many-to-many relationship)
-- Dependencies: posts, users
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT likes_pkey PRIMARY KEY (id),
    CONSTRAINT unique_like UNIQUE (post_id, user_id),
    CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ============================================
-- Table: comments
-- Description: Stores user comments on posts with admin replies
-- Dependencies: posts, users
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    photo text NULL,
    content text NOT NULL,
    reply text NULL,
    replied_at timestamptz NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ============================================
-- Table: api_usage
-- Description: Tracks daily API usage statistics
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_usage (
    date date NOT NULL,
    api_name text NULL,
    count int4 DEFAULT 0 NULL,
    CONSTRAINT api_usage_date_api_name_unique UNIQUE (date, api_name),
    CONSTRAINT api_usage_pkey PRIMARY KEY (date)
);

-- ============================================
-- Table: anime
-- Description: Stores anime information and reviews
-- ============================================
CREATE TABLE IF NOT EXISTS public.anime (
    id int8 NOT NULL,
    romaji_title varchar(255) NULL,
    english_title varchar(255) NULL,
    japanese_title varchar(255) NULL,
    start_date date NULL,
    end_date date NULL,
    episodes int4 NULL,
    cover_color varchar(7) NULL,
    cover_image_url text NULL,
    review text NULL,
    seasons_info jsonb NULL,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    season varchar(20) NULL,
    season_year int4 NULL,
    is_visible bool DEFAULT true NULL,
    CONSTRAINT anime_pkey PRIMARY KEY (id)
);

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Schema initialization completed successfully!';
END $$;
