-- 1. posts 테이블에 likes 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- 2. increment_likes RPC 함수
CREATE OR REPLACE FUNCTION increment_likes(post_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE slug = post_slug;
    -- slug가 없으면 새로 생성
    IF NOT FOUND THEN
        INSERT INTO posts (slug, likes, views) VALUES (post_slug, 1, 0);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. get_comment_counts RPC 함수 (통계 API 최적화)
CREATE OR REPLACE FUNCTION get_comment_counts()
RETURNS TABLE(slug TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY SELECT c.slug, COUNT(*)::BIGINT FROM comments c GROUP BY c.slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
