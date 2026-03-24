import { getPostData, getSortedPostsData } from '@/lib/posts';
import { resolveNanobanana, resolveNanobananaOgUrl, NANOBANANA_REGEX } from '@/lib/nanobanana';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// rehype-sanitize 스키마: 기본 + img/strong/a 등 블로그에 필요한 태그 허용
const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        img: ['src', 'alt', 'width', 'height', 'className'],
        a: ['href', 'target', 'rel', 'className', 'style'],
        div: ['className', 'style'],
        span: ['className', 'style'],
        svg: ['className', 'fill', 'stroke', 'viewBox', 'style', 'width', 'height'],
        path: ['d', 'strokeLinecap', 'strokeLinejoin', 'strokeWidth', 'fill'],
        h1: ['id'], h2: ['id'], h3: ['id'], h4: ['id'], h5: ['id'], h6: ['id'],
    },
    tagNames: [
        ...(defaultSchema.tagNames || []),
        'img', 'strong', 'em', 'del', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote',
        'pre', 'code', 'hr', 'br', 'a', 'div', 'span', 'svg', 'path',
    ],
};
import ViewTracker from '@/components/ViewTracker';
import PostStats from '@/components/PostStats';
import Comments from '@/components/Comments';
import ShareButton from '@/components/ShareButton';
import AdBanner from '@/components/AdBanner';
import NewsletterForm from '@/components/NewsletterForm';
import CoupangBanner from '@/components/CoupangBanner';
import LikeButton from '@/components/LikeButton';
import FaqSchema from '@/components/FaqSchema';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import TableOfContents from '@/components/TableOfContents';
import ScrollToTop from '@/components/ScrollToTop';
import { PILLAR_PAGES } from '@/lib/pillar-pages';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostData(slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    // OG 이미지: Supabase Storage 정적 URL 사용 (크롤러가 Gemini API 호출하지 않도록)
    const ogImage = post.image
        ? (resolveNanobananaOgUrl(post.image) || '/og-default.png')
        : '/og-default.png';

    return {
        title: post.title,
        description: post.excerpt,
        keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            tags: post.tags,
            url: `${siteUrl}/blog/${slug}`,
            images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [ogImage],
        },
    };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // 전체 포스트를 1회만 로드하여 현재 포스트 + 관련 포스트 모두 처리
    const allPosts = getSortedPostsData();
    const rawPostData = allPosts.find(p => p.slug === slug) ?? null;

    if (!rawPostData) {
        return notFound();
    }

    // Resolve Nanobanana images
    const postData = {
        ...rawPostData,
        image: resolveNanobanana(rawPostData.image || ''),
        content: rawPostData.content || ''
    };

    // Helper to render content with nanobanana tags as images
    // Also convert **bold** to <strong> for Korean text (CommonMark can't handle **bold**한글)
    // Fix legacy 🔗 standalone links → merge into preceding paragraph as inline links
    const processedContent = postData.content
        .replace(NANOBANANA_REGEX, (match) => {
            const imageUrl = resolveNanobanana(match);
            return `![Nanobanana Image](${imageUrl})`;
        })
        .replace(/\n\n\[🔗\s*/g, ' [')
        .replace(/\n\[🔗\s*/g, ' [')
        .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');

    // ShareButton에 전달할 OG 이미지 URL (전체 URL로 변환)
    const ogImage = postData.image
        ? (postData.image.startsWith('http') ? postData.image : `${siteUrl}${postData.image}`)
        : undefined;

    // Reading time estimate
    const wordCount = postData.content.replace(/<[^>]*>/g, '').length;
    const readingTime = Math.max(1, Math.round(wordCount / 500)); // ~500 chars/min for Korean

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: postData.title,
        description: postData.excerpt,
        datePublished: postData.date,
        dateModified: postData.date,
        author: {
            '@type': 'Organization',
            name: '일상감 라이프 스튜디오 편집팀',
            url: `${siteUrl}/about`,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Ilsanggam Life Studio',
            url: siteUrl,
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/blog/${slug}`,
        },
        ...(postData.image && { image: postData.image }),
        keywords: postData.tags.join(', '),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: postData.category, item: `${siteUrl}/category/${postData.category.toLowerCase().replace(/ /g, '-')}` },
            { '@type': 'ListItem', position: 3, name: postData.title, item: `${siteUrl}/blog/${slug}` },
        ],
    };

    // Related posts: scored by category match (+2) and shared tags (+1 each)
    // 관련 글이 부족하면 최신 글로 채워 내부 링크 밀도 유지 (SEO 크롤링 강화)
    const currentTags = new Set(postData.tags);
    const scoredPosts = allPosts
        .filter(p => p.slug !== slug)
        .map(p => {
            const categoryScore = p.category === postData.category ? 2 : 0;
            const tagScore = p.tags.filter(t => currentTags.has(t)).length;
            return { ...p, _score: categoryScore + tagScore };
        })
        .sort((a, b) => b._score - a._score || new Date(b.date).getTime() - new Date(a.date).getTime());
    const relatedPosts = (scoredPosts.filter(p => p._score > 0).length >= 3
        ? scoredPosts.filter(p => p._score > 0)
        : scoredPosts
    ).slice(0, 3).map(p => ({ ...p, image: resolveNanobanana(p.image || '') }));

    // Helper to generate heading ID from text content
    const generateHeadingId = (children: React.ReactNode): string => {
        const text = typeof children === 'string'
            ? children
            : Array.isArray(children)
                ? children.map((c) => (typeof c === 'string' ? c : '')).join('')
                : '';
        return text
            .toLowerCase()
            .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    return (
        <article className="min-h-screen bg-white">
            <ReadingProgressBar />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <FaqSchema content={postData.content} />
            {/* 조회수 자동 기록 (클라이언트, 세션당 1회) */}
            <ViewTracker slug={slug} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Top Breadcrumb & Share Section */}
                <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest mb-6 uppercase">
                    <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors">Home</Link>
                    <span className="text-slate-300">→</span>
                    <Link href={`/category/${postData.category.toLowerCase().replace(/ /g, '-')}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                        {postData.category}
                    </Link>
                    <ShareButton title={postData.title} description={postData.excerpt} imageUrl={ogImage} />
                </div>

                {/* Main Heading & Excerpt */}
                <header className="text-center mb-10 pb-10 border-b border-dashed border-slate-300">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-[1.2] mb-8 tracking-tighter max-w-4xl mx-auto">
                        {postData.title}
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed italic mb-10">
                        {postData.excerpt}
                    </p>

                    {/* Meta Bar */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-500 flex-wrap">
                        <Link href="/about" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-black">일</span>
                            <span className="text-slate-900">일상감 편집팀</span>
                        </Link>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-2 uppercase tracking-wider">
                            📅 {postData.date}
                        </span>
                        <PostStats slug={slug} />
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 uppercase tracking-wider">
                            ⏱ {readingTime}분 읽기
                        </span>
                    </div>

                    {/* Tags */}
                    {postData.tags.length > 0 && (
                        <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
                            {postData.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/tag/${encodeURIComponent(tag)}`}
                                    className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </header>

                {/* Main Content Area */}
                <div className="max-w-3xl mx-auto">
                    {postData.image && (
                        <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-sm bg-slate-100">
                            <Image
                                src={postData.image}
                                alt={postData.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </div>
                    )}

                    <TableOfContents />

                    <div className="prose prose-slate prose-base md:prose-lg lg:prose-xl max-w-none prose-headings:text-slate-950 prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-strong:text-slate-900 prose-a:text-blue-600">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                            components={{
                                // h2/h3: auto-generate anchor IDs for TOC
                                h2: ({ node, children, ...props }) => {
                                    const id = generateHeadingId(children);
                                    return <h2 id={id} {...props}>{children}</h2>;
                                },
                                h3: ({ node, children, ...props }) => {
                                    const id = generateHeadingId(children);
                                    return <h3 id={id} {...props}>{children}</h3>;
                                },
                                // p 안에 img가 있으면 div로 교체 (하이드레이션 에러 방지)
                                p: ({ node, children, ...props }) => {
                                    const hasImage = (node?.children ?? []).some(
                                        (child: any) => child.tagName === 'img'
                                    );
                                    if (hasImage) return <div {...props}>{children}</div>;
                                    return <p {...props}>{children}</p>;
                                },
                                // 외부 링크: 새 탭으로 열기 + 블록 스타일 (항상 새 줄)
                                a: ({ node, href, children, ...props }) => {
                                    const isExternal = href?.startsWith('http');
                                    return (
                                        <a
                                            href={href}
                                            target={isExternal ? '_blank' : undefined}
                                            rel={isExternal ? 'noopener noreferrer' : undefined}
                                            className={isExternal ? 'inline' : ''}
                                            style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
                                            {...props}
                                        >
                                            {children}
                                            {isExternal && (
                                                <svg
                                                    className="inline-block ml-1 mb-0.5"
                                                    style={{ width: '0.8em', height: '0.8em' }}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            )}
                                        </a>
                                    );
                                },
                                // 이미지: 나노바나나 AI 이미지
                                img: ({ node, ...props }) => (
                                    <div className="my-12 bg-slate-50 border border-dashed border-slate-200 p-2 overflow-hidden group">
                                        <Image
                                            src={typeof props.src === 'string' ? props.src : ''}
                                            alt={props.alt || 'Nanobanana Content Image'}
                                            width={1200}
                                            height={630}
                                            className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700"
                                        />
                                        {props.alt && props.alt !== 'Nanobanana Image' && (
                                            <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400 italic">
                                                {props.alt}
                                            </p>
                                        )}
                                    </div>
                                )
                            }}
                        >
                            {processedContent}
                        </ReactMarkdown>
                    </div>

                    {/* 저자 프로필 (E-E-A-T 강화) */}
                    <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-black shrink-0">
                                일
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 mb-1">일상감 라이프 스튜디오 편집팀</p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    일상감 라이프 스튜디오는 건강, 생활정보, 테크, 엔터테인먼트 분야의 실용적인 정보를 전문적으로 다루는 콘텐츠 팀입니다.
                                    공식 자료와 전문가 의견을 바탕으로 검증된 정보만을 제공하며, 독자 여러분의 일상에 실질적인 도움이 되는 콘텐츠를 만들기 위해 노력합니다.
                                </p>
                                <div className="flex items-center gap-3 mt-3">
                                    <Link href="/about" className="text-xs font-bold text-blue-600 hover:underline">더 알아보기</Link>
                                    <span className="text-slate-300">|</span>
                                    <Link href="/contact" className="text-xs font-bold text-blue-600 hover:underline">문의하기</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ad: 본문 하단 */}
                    <AdBanner slot="9346051403" format="auto" className="mt-8" />

                    {/* Tags Footer */}
                    {postData.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-dashed border-slate-200">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">태그</p>
                            <div className="flex flex-wrap gap-2">
                                {postData.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/tag/${encodeURIComponent(tag)}`}
                                        className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coupang Partners - AdSense 승인 전까지 완전 비활성화 */}
                    {/* <CoupangBanner className="mt-8" /> */}

                    {/* Pillar Page Guide Banner */}
                    {(() => {
                        const guide = PILLAR_PAGES.find(p => p.category.toLowerCase() === postData.category?.toLowerCase());
                        if (!guide) return null;
                        return (
                            <Link
                                href={`/guide/${guide.slug}`}
                                className="block mt-8 p-5 bg-slate-50 border border-slate-200 rounded-sm hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">{guide.category} 종합 가이드</p>
                                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{guide.title}</p>
                                    </div>
                                    <span className="text-slate-400 group-hover:text-blue-600 transition-colors text-lg">&rarr;</span>
                                </div>
                            </Link>
                        );
                    })()}

                    {/* Like Button */}
                    <div className="mt-10 flex justify-center">
                        <LikeButton slug={slug} />
                    </div>

                    {/* Share & Footer Info */}
                    <div className="mt-8 pt-8 border-t-2 border-slate-900">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">글의 끝</span>
                            <div className="flex items-center gap-4">
                                <ShareButton title={postData.title} description={postData.excerpt} imageUrl={ogImage} />
                                <Link href="/" className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:underline">홈으로</Link>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter CTA - 글 직후 */}
                    <NewsletterForm className="mt-8" />

                    {/* Comment Section - 구독 바로 아래 */}
                    <Comments slug={slug} />

                    {/* Related Posts - 댓글 아래 */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-dashed border-slate-200">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">관련 글</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {relatedPosts.map((rp) => (
                                    <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                                        {rp.image && (
                                            <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-slate-100 mb-2">
                                                <Image src={rp.image} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 250px" />
                                            </div>
                                        )}
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">{rp.title}</h4>
                                        <p className="text-xs text-slate-400 mt-1">{rp.date}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 이전/다음 글 네비게이션 */}
                    {(() => {
                        const currentIndex = allPosts.findIndex(p => p.slug === slug);
                        const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
                        const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
                        if (!prevPost && !nextPost) return null;
                        return (
                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {prevPost ? (
                                    <Link href={`/blog/${prevPost.slug}`} className="group p-4 border border-slate-200 rounded-sm hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                                        <p className="text-xs font-bold text-slate-400 mb-1">&larr; 이전 글</p>
                                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{prevPost.title}</p>
                                    </Link>
                                ) : <div />}
                                {nextPost ? (
                                    <Link href={`/blog/${nextPost.slug}`} className="group p-4 border border-slate-200 rounded-sm hover:border-blue-300 hover:bg-blue-50/30 transition-all text-right">
                                        <p className="text-xs font-bold text-slate-400 mb-1">다음 글 &rarr;</p>
                                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{nextPost.title}</p>
                                    </Link>
                                ) : <div />}
                            </div>
                        );
                    })()}
                </div>
            </div>
            <ScrollToTop />
        </article>
    );
}
