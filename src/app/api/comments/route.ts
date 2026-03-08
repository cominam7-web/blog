import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

function getServiceSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// GET: 댓글 목록 조회
export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug');
    if (!slug) {
        return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const sb = getServiceSupabase();
    const { data, count } = await sb
        .from('comments')
        .select('id, user_id, user_name, content, created_at, is_guest', { count: 'exact' })
        .eq('slug', slug)
        .order('created_at', { ascending: false });

    return NextResponse.json({
        comments: data || [],
        count: count ?? (data?.length || 0),
    });
}

// POST: 댓글 작성 (게스트 + 로그인 사용자 모두 지원)
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success: rlOk } = rateLimit(`comment:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!rlOk) {
        return NextResponse.json({ error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { slug, content, guestName, guestPassword, accessToken } = body;

        if (!slug || !content?.trim()) {
            return NextResponse.json({ error: 'slug과 content는 필수입니다.' }, { status: 400 });
        }

        if (content.trim().length > 1000) {
            return NextResponse.json({ error: '댓글은 1000자 이하로 작성해주세요.' }, { status: 400 });
        }

        // 허니팟 체크 (스팸 방지)
        if (body._hp) {
            return NextResponse.json({ success: true });
        }

        const sb = getServiceSupabase();

        // 로그인 사용자
        if (accessToken) {
            const userSb = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
            );
            const { data: { user } } = await userSb.auth.getUser();

            if (!user) {
                return NextResponse.json({ error: '인증이 만료되었습니다.' }, { status: 401 });
            }

            const { error } = await sb.from('comments').insert({
                slug,
                user_id: user.id,
                user_email: user.email ?? '',
                user_name: user.user_metadata?.display_name
                    || user.user_metadata?.full_name
                    || user.user_metadata?.name
                    || user.email?.split('@')[0]
                    || 'User',
                content: content.trim(),
                is_guest: false,
            });

            if (error) {
                return NextResponse.json({ error: '댓글 등록에 실패했습니다.' }, { status: 500 });
            }

            return NextResponse.json({ success: true });
        }

        // 게스트 사용자
        if (!guestName?.trim()) {
            return NextResponse.json({ error: '닉네임을 입력해주세요.' }, { status: 400 });
        }

        if (guestName.trim().length > 30) {
            return NextResponse.json({ error: '닉네임은 30자 이하로 입력해주세요.' }, { status: 400 });
        }

        const { error } = await sb.from('comments').insert({
            slug,
            user_id: null,
            user_email: null,
            user_name: guestName.trim(),
            content: content.trim(),
            is_guest: true,
            guest_delete_token: guestPassword ? hashPassword(guestPassword) : null,
        });

        if (error) {
            console.error('Guest comment insert error:', error);
            return NextResponse.json({ error: '댓글 등록에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
