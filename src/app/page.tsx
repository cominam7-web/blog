import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData, resolveNanobanana } from '@/lib/posts';
import { createClient } from '@supabase/supabase-js';
import LivePostStats from '@/components/LivePostStats';
import PostListWithToggle from '@/components/PostListWithToggle';
import ShareButton from '@/components/ShareButton';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

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


export default async function Home() {
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
              <ShareButton
                title={featuredPost.title}
                description={featuredPost.excerpt}
                imageUrl={featuredPost.image ? (featuredPost.image.startsWith('http') ? featuredPost.image : `${siteUrl}${featuredPost.image}`) : undefined}
              />
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

        {/* Latest Stories - 뷰 토글 + 검색 + 페이지네이션 */}
        <PostListWithToggle
          posts={remainingPosts.map(p => ({
            slug: p.slug,
            title: p.title,
            date: p.date,
            category: p.category,
            excerpt: p.excerpt || '',
            image: p.image || '',
            tags: p.tags || [],
          }))}
          title="Latest Stories"
          totalCount={remainingPosts.length}
        />
      </div>
    </main>
  );
}
