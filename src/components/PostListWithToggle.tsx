'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LivePostStats from '@/components/LivePostStats';

type PostItem = {
    slug: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    image: string;
    tags: string[];
};

type ViewMode = 'grid' | 'list';

const POSTS_PER_PAGE = 6;

export default function PostListWithToggle({
    posts,
    title,
    totalCount,
    hideTitle = false,
}: {
    posts: PostItem[];
    title: string;
    totalCount: number;
    hideTitle?: boolean;
}) {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchOpen, setSearchOpen] = useState(false);

    // localStorage에서 뷰 모드 복원
    useEffect(() => {
        const saved = localStorage.getItem('blog-view-mode');
        if (saved === 'grid' || saved === 'list') {
            setViewMode(saved);
        }
    }, []);

    // 뷰 모드 변경 시 localStorage에 저장
    const handleViewChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('blog-view-mode', mode);
    };

    // 검색 필터링
    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) return posts;
        const q = searchQuery.toLowerCase();
        return posts.filter(post =>
            post.title.toLowerCase().includes(q) ||
            post.excerpt.toLowerCase().includes(q) ||
            post.category.toLowerCase().includes(q) ||
            post.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }, [posts, searchQuery]);

    // 페이지네이션
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedPosts = filteredPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

    // 검색어 변경 시 1페이지로 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const displayCount = searchQuery.trim() ? filteredPosts.length : totalCount;

    return (
        <section>
            {/* Header: 제목 + 검색 + 뷰 토글 */}
            <div className={`flex items-center mb-8 ${hideTitle ? 'justify-end' : 'justify-between border-b-2 border-slate-900 pb-2'}`}>
                {!hideTitle && (
                    <h3 className="text-lg font-black tracking-tighter text-slate-900 uppercase shrink-0">
                        {title}
                    </h3>
                )}
                <div className="flex items-center gap-3">
                    {/* 검색 결과 수 */}
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest hidden sm:block">
                        {displayCount} posts
                    </span>

                    {/* 검색 버튼 / 검색 입력 */}
                    {searchOpen ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search posts..."
                                autoFocus
                                className="w-40 sm:w-56 px-3 py-1.5 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-slate-900 transition-colors"
                            />
                            <button
                                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                                title="Close search"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 border border-slate-200 hover:border-slate-900 rounded-sm transition-colors"
                            title="Search"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    )}

                    {/* 뷰 토글 버튼 */}
                    <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden">
                        <button
                            onClick={() => handleViewChange('grid')}
                            className={`p-1.5 transition-colors ${viewMode === 'grid'
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-400 hover:text-slate-900'
                                }`}
                            title="Grid view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleViewChange('list')}
                            className={`p-1.5 transition-colors ${viewMode === 'list'
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-400 hover:text-slate-900'
                                }`}
                            title="List view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 검색 중일 때 결과 수 표시 (모바일) */}
            {searchQuery.trim() && (
                <p className="text-sm text-slate-500 mb-6">
                    &ldquo;{searchQuery}&rdquo; 검색 결과: <strong>{filteredPosts.length}</strong>개
                </p>
            )}

            {paginatedPosts.length > 0 ? (
                <>
                    {/* Grid View */}
                    {viewMode === 'grid' && (
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
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{post.category}</p>
                                        <Link href={`/blog/${post.slug}`}>
                                            <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                                                {post.title}
                                            </h4>
                                        </Link>
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                        {post.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {post.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{post.date}</span>
                                        <span>&bull;</span>
                                        <LivePostStats slug={post.slug} />
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="divide-y divide-slate-100">
                            {paginatedPosts.map((post) => (
                                <article key={post.slug} className="group py-4 first:pt-0">
                                    <Link href={`/blog/${post.slug}`} className="flex items-start gap-4 sm:gap-6">
                                        {/* 작은 썸네일 (데스크톱만) */}
                                        <div className="hidden sm:block relative w-20 h-14 shrink-0 overflow-hidden rounded-sm bg-slate-50">
                                            {post.image ? (
                                                <Image
                                                    src={post.image}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        {/* 텍스트 정보 */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest shrink-0">
                                                    {post.category}
                                                </span>
                                                <span className="text-[10px] text-slate-300">&bull;</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {post.date}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug truncate">
                                                {post.title}
                                            </h4>
                                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-1 mt-1 hidden sm:block">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                        {/* 통계 (데스크톱) */}
                                        <div className="hidden md:flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 pt-1">
                                            <LivePostStats slug={post.slug} />
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-dashed border-slate-200">
                            {safePage > 1 && (
                                <button
                                    onClick={() => setCurrentPage(safePage - 1)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                                >
                                    &larr; Prev
                                </button>
                            )}

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors ${p === safePage
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-500 border border-slate-300 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}

                            {safePage < totalPages && (
                                <button
                                    onClick={() => setCurrentPage(safePage + 1)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                                >
                                    Next &rarr;
                                </button>
                            )}
                        </nav>
                    )}
                </>
            ) : (
                <div className="py-20 text-center">
                    {searchQuery.trim() ? (
                        <>
                            <p className="text-slate-400 font-medium italic">
                                &ldquo;{searchQuery}&rdquo;에 대한 검색 결과가 없습니다.
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="inline-block mt-6 text-sm font-bold text-blue-600 hover:underline"
                            >
                                검색 초기화
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-400 font-medium italic">아직 작성된 포스트가 없습니다.</p>
                            <Link href="/" className="inline-block mt-8 text-sm font-bold text-blue-600 hover:underline">
                                메인으로 돌아가기
                            </Link>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
