import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !key || !url.startsWith('http')) {
        return NextResponse.json({});
    }

    try {
        const supabase = createClient(url, key);
        const [viewsRes, commentsRes] = await Promise.all([
            supabase.from('posts').select('slug, views'),
            supabase.from('comments').select('slug'),
        ]);

        const stats: Record<string, { views: number; comments: number }> = {};

        if (viewsRes.data) {
            for (const row of viewsRes.data) {
                stats[row.slug] = { views: row.views ?? 0, comments: 0 };
            }
        }

        if (commentsRes.data) {
            for (const row of commentsRes.data) {
                if (!stats[row.slug]) stats[row.slug] = { views: 0, comments: 0 };
                stats[row.slug].comments++;
            }
        }

        return NextResponse.json(stats, {
            headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
        });
    } catch {
        return NextResponse.json({});
    }
}
