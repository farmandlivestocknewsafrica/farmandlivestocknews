-- ============================================================
-- Migration 009: Trending News System
-- Adds article_views tracking and a get_trending_articles()
-- function that implements weekly rotation based on view_count.
-- ============================================================

-- 1. Article Views Tracking Table
-- Tracks individual view events for granular analytics
CREATE TABLE IF NOT EXISTS article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewer_ip TEXT,
  user_agent TEXT
);

-- Index for efficient weekly queries
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON article_views(viewed_at);

-- Enable RLS
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for tracking views)
CREATE POLICY "article_views_insert_public" ON article_views
  FOR INSERT WITH CHECK (true);

-- Allow public select (for analytics)
CREATE POLICY "article_views_select_public" ON article_views
  FOR SELECT USING (true);

-- 2. Function: get_trending_articles()
-- Returns top 3 trending articles based on weekly view_count rotation.
-- Uses ISO week number to group articles into weekly buckets.
-- Falls back to previous weeks if current week has fewer than 3 articles.
--
-- Algorithm:
--   1. Get current ISO week number
--   2. Filter articles where created_at's ISO week = current week
--   3. Order by view_count DESC
--   4. Limit to 3
--   5. If < 3 results, fill with previous week's top articles
--   6. If still < 3, keep filling from previous weeks until we have 3
CREATE OR REPLACE FUNCTION get_trending_articles()
RETURNS TABLE (
  article_id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  view_count INTEGER,
  trending_rank INTEGER,
  week_number INTEGER,
  week_year INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_week INTEGER;
  current_year INTEGER;
  week_offset INTEGER := 0;
  gathered INTEGER := 0;
BEGIN
  -- Get current ISO week and year
  current_week := EXTRACT(WEEK FROM NOW())::INTEGER;
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

  -- Create temporary table to collect results
  CREATE TEMP TABLE IF NOT EXISTS _trending_results (
    article_id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    featured_image_url TEXT,
    author TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category TEXT,
    view_count INTEGER,
    trending_rank INTEGER,
    week_number INTEGER,
    week_year INTEGER
  ) ON COMMIT DROP;

  -- Clear previous results
  TRUNCATE _trending_results;

  -- Loop through weeks until we have 3 articles
  WHILE gathered < 3 AND week_offset < 52 LOOP
    INSERT INTO _trending_results
    SELECT
      a.id,
      a.title,
      a.slug,
      a.excerpt,
      a.featured_image_url,
      a.author,
      a.published_at,
      a.category,
      COALESCE(a.view_count, 0),
      0, -- will recalculate rank later
      EXTRACT(WEEK FROM a.published_at)::INTEGER,
      EXTRACT(YEAR FROM a.published_at)::INTEGER
    FROM articles a
    WHERE
      a.status = 'published'
      AND EXTRACT(WEEK FROM a.published_at) = 
        CASE
          WHEN current_week - week_offset >= 1 THEN current_week - week_offset
          ELSE current_week - week_offset + 52
        END
      AND EXTRACT(YEAR FROM a.published_at) =
        CASE
          WHEN current_week - week_offset >= 1 THEN current_year
          ELSE current_year - 1
        END
      AND a.id NOT IN (SELECT article_id FROM _trending_results)
    ORDER BY COALESCE(a.view_count, 0) DESC
    LIMIT (3 - gathered);

    gathered := (SELECT COUNT(*) FROM _trending_results);
    week_offset := week_offset + 1;
  END LOOP;

  -- Update rank based on view_count
  UPDATE _trending_results
  SET trending_rank = sub.rank
  FROM (
    SELECT article_id, ROW_NUMBER() OVER (ORDER BY view_count DESC) as rank
    FROM _trending_results
  ) sub
  WHERE _trending_results.article_id = sub.article_id;

  -- Return results
  RETURN QUERY SELECT * FROM _trending_results ORDER BY trending_rank ASC;
END;
$$;