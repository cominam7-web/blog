import { getSortedPostsData, resolveNanobanana } from '@/lib/posts';
import Link from 'next/link';
import PostListWithToggle from '@/components/PostListWithToggle';

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
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;

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

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12 border-b-2 border-slate-900 pb-4">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-2 uppercase">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span>&rarr;</span>
                        <span className="text-blue-600">Category</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        {categoryTitle}
                    </h1>
                </header>

                <PostListWithToggle
                    posts={filteredPosts.map(p => ({
                        slug: p.slug,
                        title: p.title,
                        date: p.date,
                        category: p.category || 'Hacks',
                        excerpt: p.excerpt || '',
                        image: p.image || '',
                        tags: p.tags || [],
                    }))}
                    title={categoryTitle}
                    totalCount={filteredPosts.length}
                    hideTitle
                />
            </div>
        </main>
    );
}
