import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const maxDuration = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';
const BUCKET = 'generated-images';

const STYLE_PREFIX = 'delicate watercolor painting of ';
const STYLE_SUFFIX = ', soft washes of color, wet-on-wet technique, pastel color palette, paper texture visible, gentle and artistic feel, no text, no letters, no words, no writing, no labels, no typography, no captions, purely visual illustration without any text or writing';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
}

/**
 * 글 발행 후 호출하는 엔드포인트
 * Make.com 파이프라인의 마지막 단계로 추가
 *
 * POST /api/on-publish
 * Body: { slug: "post-20260324-1200", image_prompt: "..." }
 * (content는 Supabase에서 자동으로 읽음 — body에 포함 불필요)
 * Header: Authorization: Bearer {ADMIN_API_KEY}
 *
 * 처리 순서:
 * 1. 이미지 사전생성 (Supabase Storage에 저장)
 * 2. IndexNow로 Bing/Yandex/Naver에 알림
 * 3. Google에 sitemap 변경 핑
 */
export async function POST(request: NextRequest) {
    // 인증
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY || '';
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const slug: string = body.slug || '';
    const imagePrompt: string = body.image_prompt || '';

    if (!slug) {
        return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const results: Record<string, unknown> = { slug };

    // 1. 이미지 사전생성 — 대표 이미지 + 본문 내 나노바나나 태그 모두 처리
    const prompts = new Set<string>();
    if (imagePrompt) prompts.add(imagePrompt);

    // Supabase에서 본문 content를 읽어 나노바나나 태그 추출
    try {
        const sb = getSupabaseAdmin();
        const { data: postData } = await sb
            .from('posts')
            .select('content')
            .eq('slug', slug)
            .single();

        if (postData?.content) {
            const nanoRegex = /[\[［]\s*(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]*?)[\]］]/gi;
            let match;
            while ((match = nanoRegex.exec(postData.content)) !== null) {
                const p = match[1]?.trim();
                if (p) prompts.add(p);
            }
        }
    } catch {
        // Supabase 읽기 실패해도 대표 이미지는 생성
    }

    if (prompts.size > 0) {
        const imageResults: Record<string, unknown>[] = [];
        for (const p of prompts) {
            try {
                const generated = await preGenerateImage(p);
                imageResults.push({ prompt: p.slice(0, 50), ...generated });
            } catch (e: any) {
                imageResults.push({ prompt: p.slice(0, 50), error: e.message });
            }
        }
        results.images = imageResults;
    }

    // 2. IndexNow (Bing, Yandex, Naver, Seznam)
    if (INDEXNOW_KEY) {
        try {
            const indexRes = await fetch('https://api.indexnow.org/indexnow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    host: new URL(siteUrl).hostname,
                    key: INDEXNOW_KEY,
                    keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
                    urlList: [
                        `${siteUrl}/blog/${slug}`,
                        `${siteUrl}/sitemap.xml`,
                        siteUrl,
                    ],
                }),
            });
            results.indexNow = { status: indexRes.status };
        } catch {
            results.indexNow = { error: 'failed' };
        }
    } else {
        results.indexNow = { skipped: 'INDEXNOW_KEY not set' };
    }

    // 3. Google sitemap 핑
    try {
        const googleRes = await fetch(
            `https://www.google.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`,
            { method: 'GET' }
        );
        results.googlePing = { status: googleRes.status };
    } catch {
        results.googlePing = { error: 'failed' };
    }

    return NextResponse.json({ success: true, ...results });
}

/** Gemini로 이미지를 생성하고 Supabase Storage에 저장 */
async function preGenerateImage(prompt: string): Promise<{ hash: string; exists: boolean }> {
    const styledPrompt = `${STYLE_PREFIX}${prompt.slice(0, 800)}${STYLE_SUFFIX}`;
    const hash = crypto.createHash('sha256').update(styledPrompt).digest('hex').slice(0, 16);
    const filePath = `${hash}.png`;

    const sb = getSupabaseAdmin();

    // 이미 존재하는지 확인
    const { data: existing } = await sb.storage.from(BUCKET).download(filePath);
    if (existing) {
        return { hash, exists: true };
    }

    // Gemini로 생성
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not set');
    }

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

    if (!res.ok) {
        throw new Error(`Gemini API ${res.status}`);
    }

    const json = await res.json();
    const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);

    if (!imagePart) {
        throw new Error('No image in Gemini response');
    }

    const buf = Buffer.from(imagePart.inlineData.data, 'base64');

    await sb.storage.from(BUCKET).upload(filePath, buf, {
        contentType: 'image/png',
        upsert: false,
    });

    return { hash, exists: false };
}
