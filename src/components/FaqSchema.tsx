interface FaqSchemaProps {
    content: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

export default function FaqSchema({ content }: FaqSchemaProps) {
    // Extract Q&A patterns from markdown content
    // Matches: **Q: question** or ## question? followed by answer paragraphs
    const faqs: FaqItem[] = [];

    // Pattern 1: **Q: ...** / **A: ...**
    const qaRegex = /\*\*Q[.:]?\s*(.+?)\*\*[\s\n]+\*\*A[.:]?\s*(.+?)\*\*(?=\s*\n|$)/gi;
    let match;
    while ((match = qaRegex.exec(content)) !== null) {
        faqs.push({ question: match[1].trim(), answer: match[2].trim() });
    }

    // Pattern 2: Headings that end with ? followed by paragraph text
    if (faqs.length === 0) {
        const headingRegex = /#{2,3}\s+(.+?\?)\s*\n+((?:(?!#{2,3}\s).+\n?)+)/g;
        while ((match = headingRegex.exec(content)) !== null) {
            const answer = match[2]
                .replace(/\*\*/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/<[^>]+>/g, '')
                .trim()
                .split('\n')[0];
            if (answer.length > 20) {
                faqs.push({ question: match[1].trim(), answer });
            }
        }
    }

    if (faqs.length === 0) return null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.slice(0, 10).map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
