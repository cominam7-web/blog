import { NextRequest, NextResponse } from 'next/server';

// Vercel Pro: 최대 300초 / Hobby: 10초 (Gemini 생성에 6~12초 필요)
export const maxDuration = 60;

// L1 인메모리 캐시 (동일 서버리스 인스턴스 내 중복 생성 방지)
const cache = new Map<string, { buf: Buffer; mimeType: string }>();

// 기본 이미지 스타일 (모든 나노바나나 이미지에 자동 적용)
// no text/letters: AI 이미지 모델의 텍스트 렌더링 오류(오타, 영문 혼용)를 근본적으로 방지
const STYLE_PREFIX = 'delicate watercolor painting of ';
const STYLE_SUFFIX = ', soft washes of color, wet-on-wet technique, pastel color palette, paper texture visible, gentle and artistic feel, no text, no letters, no words, no writing, no labels, no typography, no captions, purely visual illustration without any text or writing';

function buildStyledPrompt(subject: string): string {
    return `${STYLE_PREFIX}${subject}${STYLE_SUFFIX}`;
}

export async function GET(request: NextRequest) {
    const prompt = request.nextUrl.searchParams.get('prompt');
    if (!prompt) {
        return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const styledPrompt = buildStyledPrompt(prompt.slice(0, 800));

    if (cache.has(styledPrompt)) {
        const { buf, mimeType } = cache.get(styledPrompt)!;
        return new NextResponse(new Uint8Array(buf), {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=604800, immutable',
            },
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY environment variable not set' },
            { status: 500 }
        );
    }

    // gemini-2.5-flash-image: 이미지 생성 지원 최신 안정 모델
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

    // IMAGE 파트 추출
    const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);

    if (!imagePart) {
        console.error('No image in Gemini response:', JSON.stringify(json));
        return NextResponse.json({ error: 'No image in Gemini response' }, { status: 502 });
    }

    const buf = Buffer.from(imagePart.inlineData.data, 'base64');
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    cache.set(styledPrompt, { buf, mimeType });

    // Cache-Control: Vercel CDN이 7일간 캐시 → API 호출 최소화
    return new NextResponse(new Uint8Array(buf), {
        headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=604800, immutable',
        },
    });
}
