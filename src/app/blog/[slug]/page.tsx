import { getPostData, getSortedPostsData } from '@/lib/posts';
import { resolveNanobanana, NANOBANANA_REGEX } from '@/lib/nanobanana';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ViewTracker from '@/components/ViewTracker';
import PostStats from '@/components/PostStats';
import Comments from '@/components/Comments';

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
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
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
    const processedContent = postData.content.replace(NANOBANANA_REGEX, (match) => {
        const imageUrl = resolveNanobanana(match);
        return `![Nanobanana Image](${imageUrl})`;
    });

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
                    <button className="ml-4 p-1 hover:bg-slate-50 rounded-full transition-colors" title="Share this article">
                        <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
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
                            components={{
                                // p 안에 img가 있으면 div로 교체 (하이드레이션 에러 방지)
                                p: ({ node, children, ...props }) => {
                                    const hasImage = (node?.children ?? []).some(
                                        (child: any) => child.tagName === 'img'
                                    );
                                    if (hasImage) return <div {...props}>{children}</div>;
                                    return <p {...props}>{children}</p>;
                                },
                                // 외부 링크: 새 탭으로 열기 + 버튼 스타일
                                a: ({ node, href, children, ...props }) => {
                                    const isExternal = href?.startsWith('http');
                                    return (
                                        <a
                                            href={href}
                                            target={isExternal ? '_blank' : undefined}
                                            rel={isExternal ? 'noopener noreferrer' : undefined}
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

                    {/* Related/Footer Info */}
                    <div className="mt-16 pt-8 border-t-2 border-slate-900">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>End of Article</span>
                            <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <Comments slug={slug} />
                </div>
            </div>
        </article>
    );
}
