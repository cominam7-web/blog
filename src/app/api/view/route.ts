import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { slug } = await request.json();
        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 현재 views 조회
        const { data, error: fetchError } = await supabase
            .from('posts')
            .select('views')
            .eq('slug', slug)
            .single();

        if (fetchError || !data) {
            // posts 테이블에 slug 없으면 (MD만 있는 경우) 무시
            return NextResponse.json({ success: true, views: 0 });
        }

        // views + 1 업데이트
        const newViews = (data.views ?? 0) + 1;
        const { error: updateError } = await supabase
            .from('posts')
            .update({ views: newViews })
            .eq('slug', slug);

        if (updateError) {
            console.error('View update error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, views: newViews });
    } catch (e) {
        console.error('View API error:', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
