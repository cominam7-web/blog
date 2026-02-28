import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();
  const featuredPost = allPostsData[0];
  const remainingPosts = allPostsData.slice(1);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Feature Section - Lifehacker Style */}
        {featuredPost && (
          <section className="mb-20 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-6 uppercase">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>→</span>
              <Link href="#" className="hover:text-blue-600 transition-colors">Life Hacks</Link>
              <span>→</span>
              <Link href="#" className="text-blue-600 transition-colors">Trending</Link>
            </div>

            <Link href={`/blog/${featuredPost.slug}`}>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight max-w-4xl mx-auto hover:text-blue-700 transition-colors">
                {featuredPost.title}
              </h2>
            </Link>

            <p className="text-lg sm:text-xl text-slate-600 font-medium mb-8 max-w-3xl mx-auto leading-relaxed">
              {featuredPost.excerpt}
            </p>

            <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-500 mb-10 pb-10 border-b border-dashed border-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px]">👤</span>
                Ilsanggam Life
              </span>
              <span>|</span>
              <span>{featuredPost.date}</span>
              <span>|</span>
              <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
                💬 0 Comments
              </span>
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className="block group relative overflow-hidden rounded-sm bg-slate-100 aspect-[21/9] border border-slate-100 mb-10">
              <div className="w-full h-full bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                {featuredPost.image ? (
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-24 h-24 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </Link>
          </section>
        )}

        {/* Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-12 border-b-2 border-slate-900 pb-2">
            <h3 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Latest Stories</h3>
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{remainingPosts.length} posts found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {remainingPosts.map((post) => (
              <article key={post.slug} className="group border-b border-dashed border-slate-200 pb-12 last:border-0 h-full flex flex-col">
                <Link href={`/blog/${post.slug}`} className="mb-6 block overflow-hidden aspect-video bg-slate-50 rounded-sm">
                  <div className="w-full h-full flex items-center justify-center text-slate-200 group-hover:scale-105 transition-transform duration-500">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </Link>
                <div className="space-y-4 flex-grow">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hacks</p>
                  <Link href={`/blog/${post.slug}`}>
                    <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>0 comments</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
