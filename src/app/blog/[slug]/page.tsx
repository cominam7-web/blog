import { getPostData, getSortedPostsData } from '@/lib/posts';
import { resolveNanobanana, NANOBANANA_REGEX } from '@/lib/nanobanana';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ViewTracker from '@/components/ViewTracker';
import PostStats from '@/components/PostStats';
import Comments from '@/components/Comments';
import ShareButton from '@/components/ShareButton';

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

    return {
        title: post.title,
        description: post.excerpt,
        keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            tags: post.tags,
        },
    };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const rawPostData = getPostData(slug);

    // getPostData가 null을 반환하면 Next.js 404 페이지로 이동 (never를 반환하므로 TS 타입 추론 정상)
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
    const processedContent = postData.content
        .replace(NANOBANANA_REGEX, (match) => {
            const imageUrl = resolveNanobanana(match);
            return `![Nanobanana Image](${imageUrl})`;
        })
        .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');

    return (
        <article className="min-h-screen bg-white">
            {/* 조회수 자동 기록 (클라이언트, 세션당 1회) */}
            <ViewTracker slug={slug} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Top Breadcrumb & Share Section */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-black tracking-widest mb-6 uppercase">
                    <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors">Home</Link>
                    <span className="text-slate-300">→</span>
                    <Link href={`/category/${postData.category.toLowerCase().replace(/ /g, '-')}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                        {postData.category}
                    </Link>
                    <ShareButton />
                </div>

                {/* Main Heading & Excerpt */}
                <header className="text-center mb-10 pb-10 border-b border-dashed border-slate-300">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-[1.2] mb-8 tracking-tighter max-w-4xl mx-auto uppercase">
                        {postData.title}
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed italic mb-10">
                        {postData.excerpt}
                    </p>

                    {/* Meta Bar */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] font-bold text-slate-500 flex-wrap">
                        <span className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] border border-slate-200">👤</span>
                            <span className="text-slate-900">Ilsanggam Life</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-2 uppercase tracking-wider">
                            📅 {postData.date}
                        </span>
                        <PostStats slug={slug} />
                    </div>

                    {/* Tags */}
                    {postData.tags.length > 0 && (
                        <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
                            {postData.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/search?q=${encodeURIComponent(tag)}`}
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

                    <div className="prose prose-slate prose-lg lg:prose-xl max-w-none prose-headings:text-slate-950 prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-strong:text-slate-900 prose-a:text-blue-600">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
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
                                            className={isExternal ? 'block mt-3' : ''}
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
                                            <p className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
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

                    {/* Tags Footer */}
                    {postData.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-dashed border-slate-200">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {postData.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/search?q=${encodeURIComponent(tag)}`}
                                        className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share & Footer Info */}
                    <div className="mt-8 pt-8 border-t-2 border-slate-900">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">End of Article</span>
                            <div className="flex items-center gap-4">
                                <ShareButton />
                                <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Back to Home</Link>
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <Comments slug={slug} />
                </div>
            </div>
        </article>
    );
}
