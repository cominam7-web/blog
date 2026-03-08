import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getServiceSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// DELETE: 댓글 삭제 (로그인 사용자: auth, 게스트: 비밀번호 확인)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const sb = getServiceSupabase();

    // 댓글 조회
    const { data: comment } = await sb
        .from('comments')
        .select('id, user_id, is_guest, guest_delete_token')
        .eq('id', id)
        .single();

    if (!comment) {
        return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 게스트 댓글: 비밀번호 확인
    if (comment.is_guest) {
        if (!comment.guest_delete_token) {
            return NextResponse.json({ error: '삭제 비밀번호가 설정되지 않은 댓글입니다.' }, { status: 403 });
        }

        let body: { password?: string };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 });
        }

        if (!body.password) {
            return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 });
        }

        if (hashPassword(body.password) !== comment.guest_delete_token) {
            return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 });
        }
    } else {
        // 로그인 사용자: Bearer token 확인
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const userSb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
        const { data: { user } } = await userSb.auth.getUser();

        // 본인 댓글이거나 관리자만 삭제 가능
        const isOwner = user && user.id === comment.user_id;
        const isAdmin = user && user.email === process.env.ADMIN_EMAIL;
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
        }
    }

    const { error } = await sb.from('comments').delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
