import crypto from 'crypto';

export const NANOBANANA_REGEX = /[\[［]\s*(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]*?)[\]］]/gi;

// 기본 이미지 스타일 (generate-image API와 동일)
const STYLE_PREFIX = 'delicate watercolor painting of ';
const STYLE_SUFFIX = ', soft washes of color, wet-on-wet technique, pastel color palette, paper texture visible, gentle and artistic feel, no text, no letters, no words, no writing, no labels, no typography, no captions, purely visual illustration without any text or writing';

function buildStyledPrompt(subject: string): string {
    return `${STYLE_PREFIX}${subject.slice(0, 800)}${STYLE_SUFFIX}`;
}

function promptToHash(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16);
}

/** 나노바나나 태그에서 프롬프트를 추출하는 공통 로직 */
function extractPrompt(text: any): string {
    if (!text) return '';

    let input = '';
    if (Array.isArray(text)) {
        const first = text[0];
        if (first !== null && typeof first === 'object') {
            const entries = Object.entries(first as Record<string, unknown>);
            input = entries.length > 0 ? `[${entries[0][0]}: ${entries[0][1]}]` : '';
        } else {
            input = String(first || '');
        }
    } else {
        input = String(text);
    }

    if (!input.trim()) return '';

    // 이미 http URL이면 그대로 반환
    if (input.startsWith('http')) return input;

    const extractRegex = /(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]+?)(?=[\]］]|$)/i;
    const match = input.match(extractRegex);

    let prompt = '';
    if (match && match[1]) {
        prompt = match[1].trim();
    } else if (input.length > 15 && !input.startsWith('http')) {
        prompt = input.replace(/[\[\]［］]/g, '').trim();
    }

    if (prompt) {
        const cleanPrompt = prompt
            .replace(/^(?:나노|nano)[\s\S]*?[:：\-\s]\s*/i, '')
            .replace(/[\[\]]/g, '')
            .trim();

        if (cleanPrompt) return cleanPrompt;
    }

    return input;
}

/** Supabase Storage 정적 URL 생성 (크롤러 친화적) */
function generateStaticImageUrl(cleanPrompt: string): string {
    const styledPrompt = buildStyledPrompt(cleanPrompt);
    const hash = promptToHash(styledPrompt);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    return `${supabaseUrl}/storage/v1/object/public/generated-images/${hash}.png`;
}

/**
 * 나노바나나 태그를 Supabase Storage 정적 URL로 변환
 * 크롤러가 직접 접근 가능한 정적 URL을 반환 (기존: /api/generate-image 동적 API)
 */
export function resolveNanobanana(text: any): string {
    const prompt = extractPrompt(text);
    if (!prompt) return '';
    if (prompt.startsWith('http')) return prompt;
    return generateStaticImageUrl(prompt);
}

/**
 * OG 이미지용 Supabase Storage 정적 URL (resolveNanobanana와 동일)
 */
export function resolveNanobananaOgUrl(text: any): string {
    return resolveNanobanana(text);
}
