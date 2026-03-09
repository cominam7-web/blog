import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const { slug } = await request.json();
        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
        }

        // Rate limiting: IP+slug당 분당 3회 (조회수 조작 방지)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const { success: rlOk } = rateLimit(`view:${ip}:${slug}`, { limit: 3, windowMs: 60_000 });
        if (!rlOk) {
            return NextResponse.json({ success: true, views: 0 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 원자적 views + 1 업데이트 (race condition 방지)
        const { data, error: updateError } = await supabase
            .rpc('increment_views', { post_slug: slug });

        if (updateError) {
            // RPC 없으면 fallback (기존 방식)
            const { data: post } = await supabase
                .from('posts')
                .select('views')
                .eq('slug', slug)
                .single();

            if (!post) {
                return NextResponse.json({ success: true, views: 0 });
            }

            const newViews = (post.views ?? 0) + 1;
            await supabase
                .from('posts')
                .update({ views: newViews })
                .eq('slug', slug);

            return NextResponse.json({ success: true, views: newViews });
        }

        return NextResponse.json({ success: true, views: data ?? 0 });
    } catch (e) {
        console.error('View API error:', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
