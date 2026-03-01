export function resolveNanobanana(text: any): string {
    if (!text) return '';

    // Guard against gray-matter parsing YAML [tag: prompt] as an array
    if (typeof text !== 'string') {
        if (Array.isArray(text)) {
            text = String(text[0]);
        } else {
            return '';
        }
    }

    // Bulletproof regex: matches anything starting with 'nano' or '나노' inside any kind of bracket
    const nanobananaRegex = /[\[［][\s\S]*?(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]*?)[\]］]/i;
    const match = text.match(nanobananaRegex);

    if (match) {
        let prompt = match[1].trim();
        return generateImageUrl(prompt);
    }

    // New: If no match but the text looks like a prompt (long enough), treat as prompt
    const cleanedText = text.trim();
    if (cleanedText.length > 20 && !cleanedText.startsWith('http')) {
        return generateImageUrl(cleanedText);
    }

    return text;
}

function generateImageUrl(prompt: string): string {
    // Safety: Limit prompt length to 1000 characters
    let safePrompt = prompt.replace(/[\[\]]/g, '').trim();
    if (safePrompt.length > 1000) {
        safePrompt = safePrompt.substring(0, 1000);
    }

    const encodedPrompt = encodeURIComponent(safePrompt);
    const seed = Math.floor(Math.random() * 1000000);
    return `https://pollinations.ai/p/${encodedPrompt}?width=1200&height=630&nologo=true&seed=${seed}`;
}
