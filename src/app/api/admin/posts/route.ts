import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin, getServiceSupabase } from '@/lib/admin-auth';
import { createOrUpdateFile } from '@/lib/github';
import crypto from 'crypto';

export const maxDuration = 60;

/** Supabase JWT 또는 ADMIN_API_KEY 둘 다 허용 */
async function authorize(request: NextRequest): Promise<boolean> {
    // 1) ADMIN_API_KEY 확인 (Make.com 등 외부 자동화용)
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY || '';
    if (adminKey && authHeader === `Bearer ${adminKey}`) {
        return true;
    }
    // 2) Supabase JWT 확인 (어드민 패널용)
    const auth = await verifyAdmin();
    return auth.authorized;
}

export async function GET(request: NextRequest) {
    if (!(await authorize(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = getServiceSupabase();
    const { data, error } = await sb
        .from('posts')
        .select('slug, title, excerpt, status, views, created_at, content')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
}

export async function POST(request: NextRequest) {
    if (!(await authorize(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, excerpt, category, tags, imagePrompt, image_prompt, content, slugSuffix } = body;
    const resolvedImagePrompt: string = imagePrompt || image_prompt || '';

    if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug — slugSuffix가 있으면 카테고리 접미사 사용 (Make.com), 없으면 랜덤
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const suffix = slugSuffix || Math.random().toString(36).slice(2, 6);
    const slug = `post-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${suffix}`;
    const dateStr = now.toISOString().split('T')[0];

    // Build frontmatter
    const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    const imageField = resolvedImagePrompt ? `[나노바나나: ${resolvedImagePrompt}]` : '';

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

    // 4. 이미지 사전생성 (on-publish 로직 통합)
    if (resolvedImagePrompt) {
        try {
            await preGenerateImages(mdContent, resolvedImagePrompt);
        } catch {
            // 이미지 생성 실패는 비치명적
        }
    }

    // 5. IndexNow + Google Ping
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';
    const indexNowKey = process.env.INDEXNOW_KEY;
    if (indexNowKey) {
        try {
            await fetch('https://api.indexnow.org/indexnow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    host: new URL(siteUrl).hostname,
                    key: indexNowKey,
                    keyLocation: `${siteUrl}/${indexNowKey}.txt`,
                    urlList: [`${siteUrl}/blog/${slug}`, `${siteUrl}/sitemap.xml`, siteUrl],
                }),
            });
        } catch {
            // IndexNow failure is non-critical
        }
    }
    try {
        await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`);
    } catch {
        // Google ping failure is non-critical
    }

    return NextResponse.json({ success: true, slug });
}

// ── 이미지 사전생성 (on-publish에서 통합) ──

const STYLE_PREFIX = 'delicate watercolor painting of ';
const STYLE_SUFFIX = ', soft washes of color, wet-on-wet technique, pastel color palette, paper texture visible, gentle and artistic feel, no text, no letters, no words, no writing, no labels, no typography, no captions, purely visual illustration without any text or writing';
const BUCKET = 'generated-images';

async function preGenerateImages(mdContent: string, heroPrompt: string) {
    const prompts = new Set<string>();
    if (heroPrompt) prompts.add(heroPrompt);

    // 본문 내 나노바나나 태그 추출
    const nanoRegex = /[\[［]\s*(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]*?)[\]］]/gi;
    let match;
    while ((match = nanoRegex.exec(mdContent)) !== null) {
        const p = match[1]?.trim();
        if (p) prompts.add(p);
    }

    for (const p of prompts) {
        await generateAndUploadImage(p);
    }
}

async function generateAndUploadImage(prompt: string) {
    const styledPrompt = `${STYLE_PREFIX}${prompt.slice(0, 800)}${STYLE_SUFFIX}`;
    const hash = crypto.createHash('sha256').update(styledPrompt).digest('hex').slice(0, 16);
    const filePath = `${hash}.png`;

    const sb = getServiceSupabase();

    // 이미 존재하면 스킵
    const { data: existing } = await sb.storage.from(BUCKET).download(filePath);
    if (existing) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: styledPrompt }] }],
                generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
            }),
        }
    );

    if (!res.ok) return;

    const json = await res.json();
    const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart) return;

    const buf = Buffer.from(imagePart.inlineData.data, 'base64');
    await sb.storage.from(BUCKET).upload(filePath, buf, {
        contentType: 'image/png',
        upsert: false,
    });
}
