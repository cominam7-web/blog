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
