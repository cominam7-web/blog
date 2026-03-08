import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const GUIDE_MAP: Record<string, { file: string; title: string }> = {
    'money-saving-hacks': {
        file: '/guides/money-saving-hacks-2026.pdf',
        title: '2026년 돈 아끼는 생활 꿀팁 가이드',
    },
    'smart-tech-guide': {
        file: '/guides/smart-tech-guide-2026.pdf',
        title: '스마트한 디지털 생활 가이드',
    },
    'health-wellness-guide': {
        file: '/guides/health-wellness-guide-2026.pdf',
        title: '건강 관리 완벽 가이드',
    },
    'entertainment-picks': {
        file: '/guides/entertainment-picks-2026.pdf',
        title: '엔터테인먼트 추천 가이드',
    },
};

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success, remaining } = rateLimit(`download-guide:${ip}`, { limit: 10, windowMs: 60_000 });

    if (!success) {
        return NextResponse.json(
            { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
            { status: 429, headers: getRateLimitHeaders(remaining, 10) }
        );
    }

    try {
        const { email, guideSlug } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
        }

        const guide = GUIDE_MAP[guideSlug];
        if (!guide) {
            return NextResponse.json({ error: '존재하지 않는 가이드입니다.' }, { status: 400 });
        }

        const supabase = getSupabase();
        const normalizedEmail = email.toLowerCase().trim();

        // Check if already subscribed
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id, status')
            .eq('email', normalizedEmail)
            .single();

        if (existing) {
            if (existing.status !== 'active') {
                // Re-activate unsubscribed user
                await supabase
                    .from('newsletter_subscribers')
                    .update({ status: 'active', resubscribed_at: new Date().toISOString() })
                    .eq('id', existing.id);
            }
        } else {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert({
                    email: normalizedEmail,
                    status: 'active',
                    source: `guide:${guideSlug}`,
                });

            if (error) {
                console.error('Guide download subscribe error:', error);
                return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 });
            }
        }

        return NextResponse.json({
            message: '감사합니다! 가이드를 다운로드합니다.',
            downloadUrl: guide.file,
        });
    } catch {
        return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }
}
