import { NextResponse } from 'next/server';
import { verifyAdmin, getServiceSupabase } from '@/lib/admin-auth';

export async function GET() {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = getServiceSupabase();

    const [postsRes, viewsRes, commentsRes, topPostsRes, recentCommentsRes, recentPostsRes] = await Promise.all([
        sb.from('posts').select('*', { count: 'exact', head: true }),
        sb.from('posts').select('views'),
        sb.from('comments').select('*', { count: 'exact', head: true }),
        sb.from('posts').select('slug, title, views').order('views', { ascending: false }).limit(5),
        sb.from('comments').select('id, user_name, content, slug, created_at').order('created_at', { ascending: false }).limit(10),
        sb.from('posts').select('slug, title, status, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    const totalViews = (viewsRes.data || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0);

    return NextResponse.json({
        totalPosts: postsRes.count || 0,
        totalViews,
        totalComments: commentsRes.count || 0,
        topPosts: topPostsRes.data || [],
        recentComments: recentCommentsRes.data || [],
        recentPosts: recentPostsRes.data || [],
    });
}
