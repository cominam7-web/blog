import { getSortedPostsData, resolveNanobanana } from '@/lib/posts';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import PaginatedList from '@/components/PaginatedList';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    const tagSet = new Set<string>();
    for (const post of posts) {
        for (const tag of post.tags) {
            tagSet.add(tag);
        }
    }
    return Array.from(tagSet).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
    const { tag } = await params;
    const decoded = decodeURIComponent(tag);
    return {
        title: `#${decoded} 관련 글`,
        description: `일상감 라이프 스튜디오에서 "${decoded}" 태그와 관련된 모든 글을 확인하세요.`,
        alternates: { canonical: `/tag/${tag}` },
        openGraph: {
            title: `#${decoded} 관련 글 | Ilsanggam Life Studio`,
            description: `"${decoded}" 태그와 관련된 모든 글`,
            url: `${siteUrl}/tag/${tag}`,
        },
    };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const decoded = decodeURIComponent(tag);
    const allPosts = getSortedPostsData();
    const posts = allPosts
        .filter((p) => p.tags.some((t) => t === decoded))
        .map((p) => ({ ...p, image: resolveNanobanana(p.image || '') }));

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-8 mb-12">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-400 mb-4">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <span>→</span>
                        <span className="text-slate-600">태그</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
                        #{decoded}
                    </h1>
                    <p className="mt-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        {posts.length}건
                    </p>
                </div>

                {/* Results */}
                {posts.length > 0 ? (
                    <PaginatedList>
                        {posts.map((post) => (
                            <article key={post.slug} className="group border-b border-dashed border-slate-200 pb-12 last:border-0 flex flex-col md:flex-row gap-8">
                                <Link href={`/blog/${post.slug}`} className="md:w-1/3 relative aspect-video overflow-hidden rounded-sm bg-slate-50 flex-shrink-0">
                                    {post.image ? (
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-grow space-y-4">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{post.category}</p>
                                    <Link href={`/blog/${post.slug}`}>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                                            {post.title}
                                        </h2>
                                    </Link>
                                    <p className="text-slate-500 text-base leading-relaxed line-clamp-2 italic">
                                        {post.excerpt}
                                    </p>
                                    <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-400">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.category}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </PaginatedList>
                ) : (
                    <div className="text-center py-32 bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tighter mb-4">해당 태그의 글이 없습니다</h2>
                        <Link href="/" className="px-6 py-3 bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-colors">
                            홈으로
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
