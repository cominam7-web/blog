import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin, getServiceSupabase } from '@/lib/admin-auth';
import { createOrUpdateFile } from '@/lib/github';

export async function GET() {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = getServiceSupabase();
    const { data, error } = await sb
        .from('posts')
        .select('slug, title, excerpt, status, views, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
}

export async function POST(request: NextRequest) {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, excerpt, category, tags, imagePrompt, content } = body;

    if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const slug = `post-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const dateStr = now.toISOString().split('T')[0];

    // Build frontmatter
    const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    const imageField = imagePrompt ? `[나노바나나: ${imagePrompt}]` : '';

    const mdContent = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${dateStr}
excerpt: "${(excerpt || '').replace(/"/g, '\\"')}"
category: ${category || 'Hacks'}
tags: [${tagsArray.join(', ')}]
image: ${imageField}
---

${content}`;

    // 1. Push to GitHub
    const ghResult = await createOrUpdateFile(
        `src/posts/${slug}.md`,
        mdContent,
        `Add new post: ${title}`
    );

    if (!ghResult.success) {
        return NextResponse.json({ error: ghResult.error }, { status: 502 });
    }

    // 2. Sync to Supabase
    const sb = getServiceSupabase();
    await sb.from('posts').insert({
        title,
        slug,
        excerpt: excerpt || '',
        content: mdContent,
        status: 'published',
    });

    // 3. Revalidate
    revalidatePath('/');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ success: true, slug });
}
