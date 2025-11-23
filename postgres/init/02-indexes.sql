-- ============================================
-- Database Indexes
-- ============================================
-- This script creates performance indexes for the blog application
-- Run order: 01-schema.sql -> 02-indexes.sql -> 03-triggers.sql (if exists)

-- ============================================
-- Posts Table Indexes
-- ============================================
-- Index for querying posts by classification and category
CREATE INDEX IF NOT EXISTS idx_posts_classification_category
    ON public.posts(classification, category);

-- Index for ordering posts by creation date (DESC for recent first)
CREATE INDEX IF NOT EXISTS idx_posts_created_at
    ON public.posts(created_at DESC);

-- Index for finding posts by slug
CREATE INDEX IF NOT EXISTS idx_posts_slug
    ON public.posts(slug);

-- Index for filtering indexed posts
CREATE INDEX IF NOT EXISTS idx_posts_indexed
    ON public.posts(indexed);

-- ============================================
-- Comments Table Indexes
-- ============================================
-- Index for querying comments by post
CREATE INDEX IF NOT EXISTS idx_comments_post_id
    ON public.comments(post_id);

-- Index for querying comments by user
CREATE INDEX IF NOT EXISTS idx_comments_user_id
    ON public.comments(user_id);

-- Index for ordering comments by creation date
CREATE INDEX IF NOT EXISTS idx_comments_created_at
    ON public.comments(created_at DESC);

-- ============================================
-- Likes Table Indexes
-- ============================================
-- Index for counting likes per post
CREATE INDEX IF NOT EXISTS idx_likes_post_id
    ON public.likes(post_id);

-- Index for finding user's liked posts
CREATE INDEX IF NOT EXISTS idx_likes_user_id
    ON public.likes(user_id);

-- ============================================
-- Visitor Fingerprint Indexes
-- ============================================
-- Index for looking up visitors by fingerprint (already unique)
-- Note: UNIQUE constraint already creates an index, but explicit for clarity
CREATE INDEX IF NOT EXISTS idx_visitor_fingerprint_fingerprint
    ON public.visitor_fingerprint(fingerprint);

-- Index for filtering bot traffic
CREATE INDEX IF NOT EXISTS idx_visitor_fingerprint_is_bot
    ON public.visitor_fingerprint(is_bot);

-- Index for analyzing visits by country
CREATE INDEX IF NOT EXISTS idx_visitor_fingerprint_country
    ON public.visitor_fingerprint(country);

-- ============================================
-- Anime Table Indexes
-- ============================================
-- Index for filtering visible anime
CREATE INDEX IF NOT EXISTS idx_anime_is_visible
    ON public.anime(is_visible);

-- Index for querying by season and year
CREATE INDEX IF NOT EXISTS idx_anime_season_year
    ON public.anime(season, season_year);

-- GIN index for JSONB column (seasons_info)
CREATE INDEX IF NOT EXISTS idx_anime_seasons_info
    ON public.anime USING GIN(seasons_info);

-- Index for searching by title (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_anime_romaji_title
    ON public.anime(romaji_title);

-- ============================================
-- API Usage Indexes
-- ============================================
-- Index for querying usage by API name
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name
    ON public.api_usage(api_name);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_api_usage_date
    ON public.api_usage(date DESC);

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Indexes created successfully!';
END $$;