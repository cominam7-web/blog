import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
    // Rate limiting: IP당 분당 30회
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success: rlOk } = rateLimit(`stats:${ip}`, { limit: 30, windowMs: 60_000 });
    if (!rlOk) {
        return NextResponse.json({}, { status: 429 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !key || !url.startsWith('http')) {
        return NextResponse.json({});
    }

    try {
        const supabase = createClient(url, key);
        const [viewsRes, commentsRes] = await Promise.all([
            supabase.from('posts').select('slug, views'),
            supabase.rpc('get_comment_counts'),
        ]);

        const stats: Record<string, { views: number; comments: number }> = {};

        if (viewsRes.data) {
            for (const row of viewsRes.data) {
                stats[row.slug] = { views: row.views ?? 0, comments: 0 };
            }
        }

        // RPC가 없으면 fallback으로 전체 댓글 조회
        if (commentsRes.data && Array.isArray(commentsRes.data)) {
            for (const row of commentsRes.data) {
                if (!stats[row.slug]) stats[row.slug] = { views: 0, comments: 0 };
                stats[row.slug].comments = row.count ?? 0;
            }
        } else {
            // Fallback: RPC 미존재 시 기존 방식
            const fallback = await supabase.from('comments').select('slug');
            if (fallback.data) {
                for (const row of fallback.data) {
                    if (!stats[row.slug]) stats[row.slug] = { views: 0, comments: 0 };
                    stats[row.slug].comments++;
                }
            }
        }

        return NextResponse.json(stats, {
            headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
        });
    } catch {
        return NextResponse.json({});
    }
}
