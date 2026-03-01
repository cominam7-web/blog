import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Vercel Pro: 최대 300초 / Hobby: 10초 (Gemini 생성에 6~12초 필요)
export const maxDuration = 60;

const BUCKET = 'generated-images';

// 기본 이미지 스타일 (모든 나노바나나 이미지에 자동 적용)
const STYLE_PREFIX = 'delicate watercolor painting of ';
const STYLE_SUFFIX = ', soft washes of color, wet-on-wet technique, pastel color palette, paper texture visible, gentle and artistic feel, no text, no letters, no words, no writing, no labels, no typography, no captions, purely visual illustration without any text or writing';

function buildStyledPrompt(subject: string): string {
    return `${STYLE_PREFIX}${subject}${STYLE_SUFFIX}`;
}

function promptToHash(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16);
}

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
}

export async function GET(request: NextRequest) {
    const prompt = request.nextUrl.searchParams.get('prompt');
    if (!prompt) {
        return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const styledPrompt = buildStyledPrompt(prompt.slice(0, 800));
    const hash = promptToHash(styledPrompt);
    const filePath = `${hash}.png`;

    // 1. Supabase Storage에서 기존 이미지 확인
    const sb = getSupabaseAdmin();
    const { data: existingFile } = await sb.storage.from(BUCKET).download(filePath);

    if (existingFile) {
        const buf = Buffer.from(await existingFile.arrayBuffer());
        return new NextResponse(new Uint8Array(buf), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    }

    // 2. 없으면 Gemini로 새 이미지 생성
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY environment variable not set' },
            { status: 500 }
        );
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
        const errText = await res.text();
        console.error('Gemini image API error:', res.status, errText);
        return NextResponse.json(
            { error: `Gemini image generation failed: ${res.status}` },
            { status: 502 }
        );
    }

    const json = await res.json();
    const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);

    if (!imagePart) {
        console.error('No image in Gemini response:', JSON.stringify(json));
        return NextResponse.json({ error: 'No image in Gemini response' }, { status: 502 });
    }

    const buf = Buffer.from(imagePart.inlineData.data, 'base64');

    // 3. Supabase Storage에 영구 저장
    const { error: uploadError } = await sb.storage.from(BUCKET).upload(filePath, buf, {
        contentType: 'image/png',
        upsert: false,
    });

    if (uploadError) {
        console.warn('Supabase upload warning:', uploadError.message);
    }

    // Cache-Control: 1년 (Supabase에 저장되었으므로 영구 캐시 가능)
    return new NextResponse(new Uint8Array(buf), {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
