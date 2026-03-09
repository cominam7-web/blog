-- 1. 원자적 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_views(post_slug text)
RETURNS integer AS $$
DECLARE
  new_views integer;
BEGIN
  UPDATE posts SET views = COALESCE(views, 0) + 1
  WHERE slug = post_slug
  RETURNING views INTO new_views;
  RETURN COALESCE(new_views, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 뉴스레터 RLS 강화 (기존 정책 삭제 후 재생성)
-- 기존 과도한 SELECT 정책 제거
DROP POLICY IF EXISTS "Anyone can read subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "anon_select" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anon select" ON newsletter_subscribers;

-- 새 정책: anon은 자기 이메일만 조회 가능
CREATE POLICY "Users can read own subscription"
  ON newsletter_subscribers FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- 기존 과도한 UPDATE 정책 제거
DROP POLICY IF EXISTS "Anyone can update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "anon_update" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anon update" ON newsletter_subscribers;

-- 새 정책: 서비스 역할만 UPDATE 가능
CREATE POLICY "Service role can update subscribers"
  ON newsletter_subscribers FOR UPDATE
  USING (auth.role() = 'service_role');

-- INSERT는 구독 폼에서 필요하므로 유지
-- (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'newsletter_subscribers' 
    AND policyname = 'Anyone can subscribe'
  ) THEN
    CREATE POLICY "Anyone can subscribe"
      ON newsletter_subscribers FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 3. increment_views 함수에 anon 실행 권한 부여
GRANT EXECUTE ON FUNCTION increment_views(text) TO anon;
GRANT EXECUTE ON FUNCTION increment_views(text) TO authenticated;
