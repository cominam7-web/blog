export const NANOBANANA_REGEX = /[\[［][\s\S]*?(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]*?)[\]］]/gi;

export function resolveNanobanana(text: any): string {
    if (!text) return '';

    // Convert input to string and handle array case (common with gray-matter YAML)
    let input = '';
    if (Array.isArray(text)) {
        input = String(text[0] || '');
    } else {
        input = String(text);
    }

    if (!input.trim()) return '';

    // Step 1: Extract prompt using a very flexible regex
    // This handles both [나노바나나: prompt] and just "나노바나나: prompt" (if brackets were stripped)
    const extractRegex = /(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]+?)(?=[\]］]|$)/i;
    const match = input.match(extractRegex);

    let prompt = '';
    if (match && match[1]) {
        prompt = match[1].trim();
    } else if (input.length > 15 && !input.startsWith('http')) {
        // Fallback: If no tag found but string is long and not a URL, treat as raw prompt
        prompt = input.replace(/[\[\]［］]/g, '').trim();
    }

    if (prompt) {
        // Step 2: Final cleanup of the prompt
        // Remove common artifacts and leftover prefixes
        let cleanPrompt = prompt
            .replace(/^(?:나노|nano)[\s\S]*?[:：\-\s]\s*/i, '') // Remove prefix if still there
            .replace(/[\[\]]/g, '') // Ensure no brackets
            .trim();

        if (cleanPrompt) {
            return generateImageUrl(cleanPrompt);
        }
    }

    return input;
}

function generateImageUrl(prompt: string): string {
    // Safety: Limit prompt length and ensure valid encoding
    let safePrompt = prompt.substring(0, 1000).trim();
    const encodedPrompt = encodeURIComponent(safePrompt);
    const seed = Math.floor(Math.random() * 1000000);

    // Using image.pollinations.ai for better compatibility
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&seed=${seed}`;
}
