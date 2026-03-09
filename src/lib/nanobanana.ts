export const NANOBANANA_REGEX = /[\[［]\s*(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]*?)[\]］]/gi;

export function resolveNanobanana(text: any): string {
    if (!text) return '';

    // YAML에서 [나노바나나: prompt] 구문은 flow sequence로 파싱됨
    // 예: [{ '나노바나나': 'prompt text' }] 형태가 되므로 재조립 필요
    let input = '';
    if (Array.isArray(text)) {
        const first = text[0];
        if (first !== null && typeof first === 'object') {
            // YAML이 { '나노바나나': 'prompt' } 객체로 파싱한 경우 → 태그 문자열로 재조립
            const entries = Object.entries(first as Record<string, unknown>);
            input = entries.length > 0 ? `[${entries[0][0]}: ${entries[0][1]}]` : '';
        } else {
            input = String(first || '');
        }
    } else {
        input = String(text);
    }

    if (!input.trim()) return '';

    // Step 1: Extract prompt using a very flexible regex
    const extractRegex = /(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]+?)(?=[\]］]|$)/i;
    const match = input.match(extractRegex);

    let prompt = '';
    if (match && match[1]) {
        prompt = match[1].trim();
    } else if (input.length > 15 && !input.startsWith('http')) {
        prompt = input.replace(/[\[\]［］]/g, '').trim();
    }

    if (prompt) {
        let cleanPrompt = prompt
            .replace(/^(?:나노|nano)[\s\S]*?[:：\-\s]\s*/i, '')
            .replace(/[\[\]]/g, '')
            .trim();

        if (cleanPrompt) {
            return generateImageUrl(cleanPrompt);
        }
    }

    return input;
}

function generateImageUrl(prompt: string): string {
    const safePrompt = prompt.slice(0, 1000).trim();
    // Gemini Imagen 3 API를 통한 AI 이미지 생성 (서버사이드 API 라우트)
    return `/api/generate-image?prompt=${encodeURIComponent(safePrompt)}`;
}

// OG 이미지용: Supabase Storage에 이미 저장된 이미지의 정적 public URL 생성
// 크롤러가 접근해도 Gemini API를 호출하지 않음
export function resolveNanobananaOgUrl(text: any): string {
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
    } else if (input.length > 15) {
        prompt = input.replace(/[\[\]［］]/g, '').trim();
    }

    if (prompt) {
        const cleanPrompt = prompt
            .replace(/^(?:나노|nano)[\s\S]*?[:：\-\s]\s*/i, '')
            .replace(/[\[\]]/g, '')
            .trim();

        if (cleanPrompt) {
            // generate-image API와 동일한 해시 로직으로 Storage public URL 생성
            const { createHash } = require('crypto');
            const STYLE_PREFIX = 'delicate watercolor painting of ';
            const STYLE_SUFFIX = ', soft washes of color, wet-on-wet technique, pastel color palette, paper texture visible, gentle and artistic feel, no text, no letters, no words, no writing, no labels, no typography, no captions, purely visual illustration without any text or writing';
            const styledPrompt = `${STYLE_PREFIX}${cleanPrompt.slice(0, 800)}${STYLE_SUFFIX}`;
            const hash = createHash('sha256').update(styledPrompt).digest('hex').slice(0, 16);
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            return `${supabaseUrl}/storage/v1/object/public/generated-images/${hash}.png`;
        }
    }

    return '';
}
