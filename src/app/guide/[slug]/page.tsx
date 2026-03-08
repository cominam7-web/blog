import { getSortedPostsData, resolveNanobanana } from '@/lib/posts';
import { getPillarPage, getAllPillarSlugs, PILLAR_PAGES } from '@/lib/pillar-pages';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import NewsletterForm from '@/components/NewsletterForm';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

export async function generateStaticParams() {
    return getAllPillarSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const pillar = getPillarPage(slug);
    if (!pillar) return {};

    return {
        title: pillar.title,
        description: pillar.metaDescription,
        alternates: { canonical: `/guide/${slug}` },
        openGraph: {
            title: pillar.title,
            description: pillar.metaDescription,
            url: `${siteUrl}/guide/${slug}`,
            type: 'article',
        },
    };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const pillar = getPillarPage(slug);
    if (!pillar) notFound();

    const allPosts = getSortedPostsData();
    const categoryPosts = allPosts.filter(
        p => p.category?.toLowerCase() === pillar.category.toLowerCase()
    );

    // 각 섹션에 관련 글 매칭
    const sectionsWithPosts = pillar.sections.map(section => {
        const matched = categoryPosts.filter(post => {
            const text = `${post.title} ${post.excerpt} ${(post.tags || []).join(' ')}`.toLowerCase();
            return section.tags.some(tag => text.includes(tag.toLowerCase()));
        });
        return { ...section, posts: matched };
    });

    // 어떤 섹션에도 매칭되지 않은 글
    const matchedSlugs = new Set(sectionsWithPosts.flatMap(s => s.posts.map(p => p.slug)));
    const uncategorized = categoryPosts.filter(p => !matchedSlugs.has(p.slug));

    // JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pillar.title,
        description: pillar.metaDescription,
        url: `${siteUrl}/guide/${slug}`,
        publisher: {
            '@type': 'Organization',
            name: 'Ilsanggam Life Studio',
            url: siteUrl,
        },
    };

    // 다른 가이드 페이지 (현재 제외)
    const otherGuides = PILLAR_PAGES.filter(p => p.slug !== slug);

    return (
        <main className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-8 uppercase">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <span>&rarr;</span>
                    <Link href={`/category/${pillar.category.toLowerCase()}`} className="hover:text-blue-600 transition-colors">{pillar.category}</Link>
                    <span>&rarr;</span>
                    <span className="text-blue-600">Guide</span>
                </div>

                {/* Header */}
                <header className="mb-12 pb-8 border-b border-dashed border-slate-300">
                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                        {pillar.category} 종합 가이드
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                        {pillar.title}
                    </h1>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        {pillar.description}
                    </p>
                </header>

                {/* Intro */}
                <div className="prose prose-slate lg:prose-lg max-w-none mb-12">
                    <p className="text-slate-600 leading-relaxed">{pillar.intro}</p>
                </div>

                {/* Table of Contents */}
                <nav className="bg-slate-50 border border-slate-200 rounded-sm p-6 mb-12">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">목차</h2>
                    <ol className="space-y-2">
                        {sectionsWithPosts.map((section, i) => (
                            <li key={i}>
                                <a
                                    href={`#section-${i}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    {i + 1}. {section.title}
                                    <span className="text-slate-400 text-sm ml-2">({section.posts.length}편)</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Sections */}
                {sectionsWithPosts.map((section, i) => (
                    <section key={i} id={`section-${i}`} className="mb-16">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            {section.title}
                        </h2>
                        <p className="text-slate-500 mb-6">{section.description}</p>

                        {section.posts.length > 0 ? (
                            <div className="grid gap-4">
                                {section.posts.map(post => {
                                    const image = resolveNanobanana(post.image || '');
                                    return (
                                        <Link
                                            key={post.slug}
                                            href={`/blog/${post.slug}`}
                                            className="group flex gap-4 p-4 border border-slate-100 rounded-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                                        >
                                            {image && (
                                                <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-sm bg-slate-100">
                                                    <Image
                                                        src={image}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="96px"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                                    {post.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{post.excerpt}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">관련 글이 곧 업데이트됩니다.</p>
                        )}
                    </section>
                ))}

                {/* Uncategorized posts */}
                {uncategorized.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            더 알아보기
                        </h2>
                        <p className="text-slate-500 mb-6">그 외 유용한 {pillar.category} 관련 글입니다.</p>
                        <div className="grid gap-4">
                            {uncategorized.map(post => {
                                const image = resolveNanobanana(post.image || '');
                                return (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group flex gap-4 p-4 border border-slate-100 rounded-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                                    >
                                        {image && (
                                            <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-sm bg-slate-100">
                                                <Image
                                                    src={image}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="96px"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{post.excerpt}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Newsletter */}
                <NewsletterForm className="mb-12" />

                {/* Other Guides */}
                <section className="pt-8 border-t border-dashed border-slate-200">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">다른 가이드 보기</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {otherGuides.map(guide => (
                            <Link
                                key={guide.slug}
                                href={`/guide/${guide.slug}`}
                                className="group block p-4 border border-slate-100 rounded-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                            >
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{guide.category}</div>
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                                    {guide.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
