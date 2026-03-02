import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData, resolveNanobanana } from '@/lib/posts';
import { createClient } from '@supabase/supabase-js';
import LivePostStats from '@/components/LivePostStats';

// ISR: 1시간마다 재생성 → 조회수 변동 반영
export const revalidate = 3600;

// Supabase 클라이언트 생성 (서버 컴포넌트용)
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key || !url.startsWith('http')) return null;
  return createClient(url, key);
}

// Supabase에서 조회수 가장 높은 포스트 slug 조회
async function getMostViewedSlug(): Promise<string | null> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('posts')
      .select('slug, views')
      .order('views', { ascending: false })
      .limit(1)
      .single();

    if (error || !data || (data.views ?? 0) === 0) return null;
    return data.slug;
  } catch {
    return null;
  }
}


const POSTS_PER_PAGE = 6;

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);

  // MD 파일에서 전체 포스트 로드 (날짜 내림차순)
  const allPostsData = getSortedPostsData().map(post => ({
    ...post,
    image: resolveNanobanana(post.image)
  }));

  // Featured: 조회수 1위 글 (없으면 최신 글로 fallback)
  const mostViewedSlug = await getMostViewedSlug();
  const featuredPost =
    (mostViewedSlug ? allPostsData.find(p => p.slug === mostViewedSlug) : null)
    ?? allPostsData[0];

  // Latest Stories: 날짜 내림차순 (가장 최근 글이 맨 왼쪽), featured 제외
  const remainingPosts = allPostsData.filter(p => p.slug !== featuredPost?.slug);
  const totalPages = Math.max(1, Math.ceil(remainingPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = remainingPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Feature Section - Lifehacker Style */}
        {featuredPost && (
          <section className="mb-20 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-6 uppercase">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span>→</span>
              <Link href={`/category/${featuredPost.category.toLowerCase().replace(/ /g, '-')}`} className="hover:text-blue-600 transition-colors">{featuredPost.category}</Link>
              <button className="ml-4 p-1 hover:bg-slate-50 rounded-full transition-colors" title="Share this article">
                <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
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
              <LivePostStats slug={featuredPost.slug} variant="featured" />
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className="block group relative overflow-hidden rounded-sm bg-slate-100 aspect-[21/9] border border-slate-100 mb-10">
              {featuredPost.image ? (
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                  <svg className="w-24 h-24 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </Link>
          </section>
        )}

        {/* Latest Stories Grid - 날짜 내림차순 (왼쪽 = 최신) */}
        <section>
          <div className="flex items-center justify-between mb-12 border-b-2 border-slate-900 pb-2">
            <h3 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Latest Stories</h3>
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{remainingPosts.length} posts found</span>
          </div>

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
                  <span>•</span>
                  <LivePostStats slug={post.slug} />
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-dashed border-slate-200">
              {safePage > 1 && (
                <Link
                  href={safePage === 2 ? '/' : `/?page=${safePage - 1}`}
                  className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                >
                  ← Prev
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={p === 1 ? '/' : `/?page=${p}`}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors ${
                    p === safePage
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </Link>
              ))}

              {safePage < totalPages && (
                <Link
                  href={`/?page=${safePage + 1}`}
                  className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
