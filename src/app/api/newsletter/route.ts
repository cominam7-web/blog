import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success, remaining } = rateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 60_000 });

    if (!success) {
        return NextResponse.json(
            { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
            { status: 429, headers: getRateLimitHeaders(remaining, 5) }
        );
    }

    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Check if already subscribed
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id, status')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existing) {
            if (existing.status === 'active') {
                return NextResponse.json({ message: '이미 구독 중입니다!' });
            }
            // Re-activate unsubscribed user
            await supabase
                .from('newsletter_subscribers')
                .update({ status: 'active', resubscribed_at: new Date().toISOString() })
                .eq('id', existing.id);
            return NextResponse.json({ message: '다시 구독되었습니다!' });
        }

        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert({
                email: email.toLowerCase().trim(),
                status: 'active',
                source: 'website',
            });

        if (error) {
            console.error('Newsletter subscribe error:', error);
            return NextResponse.json({ error: '구독 처리 중 오류가 발생했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ message: '구독 완료! 감사합니다.' });
    } catch {
        return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }
}
