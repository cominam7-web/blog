import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();
  const featuredPost = allPostsData[0];
  const remainingPosts = allPostsData.slice(1);

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="py-16 border-b border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter sm:text-7xl mb-4">
            Ilsanggam Life Studio
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            더 나은 일상을 위한 AI 자동화 지식 스튜디오. <br className="hidden sm:block" />
            스마트한 생활 팁과 전문 정보를 매일 만드세요.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Feature Section */}
        {featuredPost && (
          <section className="mb-20">
            <div className="group relative overflow-hidden rounded-3xl bg-slate-100 aspect-[16/9] sm:aspect-[21/9] border border-slate-100">
              {/* 실제 이미지가 있다면 아래 img 태그를 활성화할 수 있습니다 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 sm:p-12 w-full">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-widest shadow-lg">
                  Latest Update
                </span>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white hover:text-blue-200 transition-colors leading-tight mb-4 drop-shadow-md">
                    {featuredPost.title}
                  </h2>
                </Link>
                <p className="text-slate-300 text-lg max-w-2xl line-clamp-2 drop-shadow-sm font-medium">
                  {featuredPost.excerpt}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-bold text-slate-900">Explore More</h3>
            <span className="text-slate-400 text-sm">{remainingPosts.length} posts found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {remainingPosts.map((post) => (
              <article key={post.slug} className="group">
                <div className="mb-6 aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  {/* 이미지 렌더링 영역 (필요 시 추가) */}
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Knowledge</p>
                  <Link href={`/blog/${post.slug}`}>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {post.title}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-2 text-slate-400 text-sm italic font-medium">
                    <span>{post.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed line-clamp-3 font-medium">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
