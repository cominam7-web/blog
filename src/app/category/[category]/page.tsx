import { getSortedPostsData, resolveNanobanana } from '@/lib/posts';
import Link from 'next/link';
import PostListWithToggle from '@/components/PostListWithToggle';
import type { Metadata } from 'next';

import { CATEGORY_SLUGS, slugToCategory } from '@/lib/categories';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    latest: '최신 생활 정보, 꿀팁, AI 인사이트를 한눈에 확인하세요.',
    hacks: '일상의 효율을 극대화하는 스마트한 생활 꿀팁 모음.',
    tech: '최신 기술 트렌드와 IT 정보를 쉽고 빠르게 전달합니다.',
    entertainment: '영화, 드라마, 게임 등 엔터테인먼트 소식과 리뷰.',
    health: '건강한 생활을 위한 운동, 식단, 웰빙 정보.',
    reviews: '제품 및 서비스에 대한 솔직한 리뷰와 비교 분석.',
    deals: '놓치면 후회할 할인, 세일, 알뜰 쇼핑 정보.',
    'best-picks': '분야별 베스트 추천 아이템과 큐레이션.',
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const categoryName = slugToCategory(category) || category.toUpperCase().replace(/-/g, ' ');
    const description = CATEGORY_DESCRIPTIONS[category.toLowerCase()] || `${categoryName} 관련 최신 콘텐츠를 확인하세요.`;

    return {
        title: `${categoryName} - 카테고리`,
        description,
        alternates: { canonical: `/category/${category}` },
        openGraph: {
            title: `${categoryName} - Ilsanggam Life Studio`,
            description,
            url: `${siteUrl}/category/${category}`,
        },
    };
}

export async function generateStaticParams() {
    return CATEGORY_SLUGS.map((cat) => ({
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
                    breadcrumb={
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-2 uppercase">
                            <Link href="/" className="hover:text-blue-600">Home</Link>
                            <span>&rarr;</span>
                            <span className="text-blue-600">Category</span>
                        </div>
                    }
                />
            </div>
        </main>
    );
}
