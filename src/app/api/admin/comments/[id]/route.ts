import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, getServiceSupabase } from '@/lib/admin-auth';

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const sb = getServiceSupabase();
    const { error } = await sb.from('comments').delete().eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
