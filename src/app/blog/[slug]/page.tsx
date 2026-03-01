import { getPostData, getSortedPostsData } from '@/lib/posts';
import { resolveNanobanana, NANOBANANA_REGEX } from '@/lib/nanobanana';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ViewTracker from '@/components/ViewTracker';

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
                    <span className="text-slate-300">→</span>
                    <span className="text-blue-600">Trending</span>
                    <button className="ml-4 p-1 hover:bg-slate-50 rounded-full transition-colors" title="Share this article">
                        <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>

                {/* Main Heading & Excerpt */}
                <header className="text-center mb-10 pb-10 border-b border-dashed border-slate-300">
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter max-w-4xl mx-auto uppercase">
                        {postData.title}
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed italic mb-10">
                        {postData.excerpt}
                    </p>

                    {/* Meta Bar */}
                    <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] border border-slate-200">👤</span>
                            <span className="text-slate-900">Ilsanggam Life</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-2 uppercase tracking-wider">
                            📅 {postData.date}
                        </span>
                        <span className="text-slate-300">|</span>
                        <Link href="#comments" className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase tracking-wider">
                            💬 0 Comments
                        </Link>
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

                    {/* Comment Section Placeholder (Conversation) */}
                    <section id="comments" className="mt-20">
                        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-8">
                            <div className="flex items-baseline gap-4">
                                <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Conversation</h3>
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest pl-2 border-l border-slate-200">0 Comments</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                2 Viewing
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-sm border border-slate-200 mb-8 sm:flex justify-between items-center">
                            <p className="text-slate-600 text-sm font-medium mb-4 sm:mb-0 max-w-xl leading-snug">
                                Have fun. Be respectful. Feel free to criticize ideas, but not people. Lifehacker has a <Link href="/privacy" className="text-blue-600 hover:underline">strict commenting policy.</Link>
                            </p>
                            <div className="flex gap-4">
                                <button className="px-4 py-2 bg-white border border-slate-300 text-[10px] font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-colors">Log In</button>
                                <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">Sign Up</button>
                            </div>
                        </div>

                        <div className="flex justify-start mb-6">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Sort by
                                <select className="bg-transparent border-none p-0 text-slate-900 font-black uppercase focus:ring-0">
                                    <option>Best</option>
                                    <option>Newest</option>
                                    <option>Oldest</option>
                                </select>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-sm p-4 bg-white shadow-sm mb-12">
                            <textarea
                                className="w-full h-24 p-4 border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400 resize-none"
                                placeholder="What do you think?"
                            ></textarea>
                            <div className="flex justify-between items-center border-t border-slate-100 pt-4 px-2">
                                <div className="flex gap-4">
                                    <button className="text-slate-400 hover:text-slate-600 p-1">📷</button>
                                    <button className="text-slate-400 hover:text-slate-600 p-1">GIF</button>
                                </div>
                                <button className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Post</button>
                            </div>
                        </div>

                        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                            <p className="text-slate-400 font-medium italic">No comments yet. Start the conversation!</p>
                        </div>
                    </section>
                </div>
            </div>
        </article>
    );
}
