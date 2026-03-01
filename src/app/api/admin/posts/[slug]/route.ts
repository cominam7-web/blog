import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin, getServiceSupabase } from '@/lib/admin-auth';
import { getFileSha, getFileContent, createOrUpdateFile, deleteFile } from '@/lib/github';
import matter from 'gray-matter';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const filePath = `src/posts/${slug}.md`;
    const rawContent = await getFileContent(filePath);

    if (!rawContent) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { data: frontmatter, content } = matter(rawContent);

    // Extract image prompt from parsed image field
    let imagePrompt = '';
    const img = frontmatter.image;
    if (img) {
        let input = '';
        if (Array.isArray(img)) {
            const first = img[0];
            if (first !== null && typeof first === 'object') {
                const entries = Object.entries(first as Record<string, unknown>);
                input = entries.length > 0 ? String(entries[0][1] || '') : '';
            } else {
                input = String(first || '');
            }
        } else {
            input = String(img);
        }
        const match = input.match(/(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]+?)(?=[\]］]|$)/i);
        imagePrompt = match ? match[1].trim() : input.replace(/[\[\]［］]/g, '').trim();
    }

    return NextResponse.json({
        slug,
        title: frontmatter.title || slug,
        date: frontmatter.date ? String(frontmatter.date).split('T')[0] : '',
        excerpt: frontmatter.excerpt || '',
        category: frontmatter.category || 'Hacks',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        imagePrompt,
        content: content.trim(),
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, excerpt, category, tags, imagePrompt, content, date } = body;

    if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    const imageField = imagePrompt ? `[나노바나나: ${imagePrompt}]` : '';
    const dateStr = date || new Date().toISOString().split('T')[0];

    const mdContent = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${dateStr}
excerpt: "${(excerpt || '').replace(/"/g, '\\"')}"
category: ${category || 'Hacks'}
tags: [${tagsArray.join(', ')}]
image: ${imageField}
---

${content}`;

    // 1. Get current file SHA from GitHub
    const filePath = `src/posts/${slug}.md`;
    const sha = await getFileSha(filePath);

    // 2. Update on GitHub
    const ghResult = await createOrUpdateFile(
        filePath,
        mdContent,
        `Update post: ${title}`,
        sha
    );

    if (!ghResult.success) {
        return NextResponse.json({ error: ghResult.error }, { status: 502 });
    }

    // 3. Sync to Supabase
    const sb = getServiceSupabase();
    await sb.from('posts').update({
        title,
        excerpt: excerpt || '',
        content: mdContent,
    }).eq('slug', slug);

    // 4. Revalidate
    revalidatePath('/');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ success: true });
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // 1. Get file SHA from GitHub
    const filePath = `src/posts/${slug}.md`;
    const sha = await getFileSha(filePath);

    if (sha) {
        const ghResult = await deleteFile(filePath, sha, `Delete post: ${slug}`);
        if (!ghResult.success) {
            return NextResponse.json({ error: ghResult.error }, { status: 502 });
        }
    }

    // 2. Delete from Supabase
    const sb = getServiceSupabase();
    await sb.from('comments').delete().eq('slug', slug);
    await sb.from('posts').delete().eq('slug', slug);

    // 3. Revalidate
    revalidatePath('/');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ success: true });
}
