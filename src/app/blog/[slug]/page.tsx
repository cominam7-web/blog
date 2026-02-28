import { getPostData, getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = getPostData(slug);

    return (
        <article className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-8 inline-block">
                    ← 목록으로 돌아가기
                </Link>

                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                        {postData.title}
                    </h1>
                    <p className="mt-4 text-slate-500">{postData.date}</p>
                </header>

                <div className="prose prose-slate lg:prose-xl max-w-none">
                    {/* 
            실무에서는 markdown-to-html 변환기(remark, rehype 등)를 쓰지만, 
            지금은 컨셉 확인용으로 단순 표시합니다. 
          */}
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                        {postData.content}
                    </div>
                </div>
            </div>
        </article>
    );
}
