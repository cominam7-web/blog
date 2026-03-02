import { getSortedPostsData, resolveNanobanana } from '@/lib/posts';
import Link from 'next/link';
import Image from 'next/image';
import LivePostStats from '@/components/LivePostStats';

const POSTS_PER_PAGE = 6;

export async function generateStaticParams() {
    const categories = [
        'latest', 'tech', 'best-picks', 'entertainment', 'health',
        'reviews', 'home-&-garden', 'deals', 'comparisons', 'hacks'
    ];
    return categories.map((cat) => ({
        category: cat,
    }));
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { category } = await params;
    const { page } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);

    const allPosts = getSortedPostsData();

    // 카테고리 필터링 로직 (LATEST는 전체 보기)
    const rawFilteredPosts = category.toLowerCase() === 'latest'
        ? allPosts
        : allPosts.filter(post =>
            post.category?.toLowerCase().replace(/ /g, '-') === category.toLowerCase()
        );

    // Resolve Nanobanana images
    const filteredPosts = rawFilteredPosts.map(post => ({
        ...post,
        image: resolveNanobanana(post.image || '')
    }));

    const categoryTitle = category.toUpperCase().replace(/-/g, ' ');
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedPosts = filteredPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);
    const basePath = `/category/${category}`;

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12 border-b-2 border-slate-900 pb-4">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-2 uppercase">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span>&rarr;</span>
                        <span className="text-blue-600">Category</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            {categoryTitle}
                        </h1>
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                            {filteredPosts.length} posts
                        </span>
                    </div>
                </header>

                {paginatedPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                            {paginatedPosts.map((post) => (
                                <article key={post.slug} className="group border-b border-dashed border-slate-200 pb-12 last:border-0 h-full flex flex-col">
                                    <Link href={`/blog/${post.slug}`} className="relative mb-6 block overflow-hidden aspect-video bg-slate-50 rounded-sm">
                                        {post.image ? (
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200 group-hover:scale-105 transition-transform duration-500">
                                                <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </Link>
                                    <div className="space-y-4 flex-grow">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{post.category || 'Hacks'}</p>
                                        <Link href={`/blog/${post.slug}`}>
                                            <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                                                {post.title}
                                            </h4>
                                        </Link>
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{post.date}</span>
                                        <span>&bull;</span>
                                        <LivePostStats slug={post.slug} />
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-dashed border-slate-200">
                                {safePage > 1 && (
                                    <Link
                                        href={safePage === 2 ? basePath : `${basePath}?page=${safePage - 1}`}
                                        className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                                    >
                                        &larr; Prev
                                    </Link>
                                )}

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <Link
                                        key={p}
                                        href={p === 1 ? basePath : `${basePath}?page=${p}`}
                                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors ${
                                            p === safePage
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-500 border border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        {p}
                                    </Link>
                                ))}

                                {safePage < totalPages && (
                                    <Link
                                        href={`${basePath}?page=${safePage + 1}`}
                                        className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                                    >
                                        Next &rarr;
                                    </Link>
                                )}
                            </nav>
                        )}
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-medium italic">이 카테고리에 아직 작성된 포스트가 없습니다.</p>
                        <Link href="/" className="inline-block mt-8 text-sm font-bold text-blue-600 hover:underline">
                            메인으로 돌아가기
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
