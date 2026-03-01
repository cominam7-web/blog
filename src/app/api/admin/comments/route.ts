import { NextResponse } from 'next/server';
import { verifyAdmin, getServiceSupabase } from '@/lib/admin-auth';

export async function GET() {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = getServiceSupabase();
    const { data, error } = await sb
        .from('comments')
        .select('id, user_name, user_email, content, slug, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data || [] });
}
