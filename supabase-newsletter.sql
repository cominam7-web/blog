-- newsletter_subscribers 테이블 생성
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resubscribed_at TIMESTAMPTZ
);

-- 이메일 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);

-- RLS 활성화
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- anon 사용자는 INSERT만 가능 (구독 신청)
CREATE POLICY "Allow anonymous subscribe" ON newsletter_subscribers
    FOR INSERT TO anon
    WITH CHECK (true);

-- anon 사용자는 자기 이메일만 SELECT 가능 (중복 확인용)
CREATE POLICY "Allow anonymous email check" ON newsletter_subscribers
    FOR SELECT TO anon
    USING (true);

-- anon 사용자는 UPDATE 가능 (재구독용)
CREATE POLICY "Allow anonymous resubscribe" ON newsletter_subscribers
    FOR UPDATE TO anon
    USING (true)
    WITH CHECK (true);
