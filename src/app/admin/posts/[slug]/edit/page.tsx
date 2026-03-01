import { getSortedPostsData, getPostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({ slug: post.slug }));
}

function extractImagePrompt(imageField: any): string {
    if (!imageField) return '';

    let input = '';
    if (Array.isArray(imageField)) {
        const first = imageField[0];
        if (first !== null && typeof first === 'object') {
            const entries = Object.entries(first as Record<string, unknown>);
            input = entries.length > 0 ? String(entries[0][1] || '') : '';
        } else {
            input = String(first || '');
        }
    } else {
        input = String(imageField);
    }

    // Extract prompt from [나노바나나: prompt] syntax
    const match = input.match(/(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]+?)(?=[\]］]|$)/i);
    return match ? match[1].trim() : input.replace(/[\[\]［］]/g, '').trim();
}

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostData(slug);

    if (!post) {
        notFound();
    }

    const initialData = {
        slug: post.slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags,
        imagePrompt: extractImagePrompt(post.image),
        content: post.content,
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Edit Post</h1>
            <p className="text-xs text-slate-400 mb-8 font-mono">{slug}</p>
            <PostEditor mode="edit" initialData={initialData} />
        </div>
    );
}
