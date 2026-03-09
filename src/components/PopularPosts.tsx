import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { getSortedPostsData } from '@/lib/posts';

// Supabase 클라이언트 생성 (서버 컴포넌트용)
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key || !url.startsWith('http')) return null;
  return createClient(url, key);
}

// Supabase에서 조회수 상위 5개 포스트 조회
async function getTopPosts(): Promise<{ slug: string; views: number }[]> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('posts')
      .select('slug, views')
      .order('views', { ascending: false })
      .limit(5);

    if (error || !data) return [];
    return data.filter((d) => (d.views ?? 0) > 0);
  } catch {
    return [];
  }
}

export default async function PopularPosts() {
  const topPosts = await getTopPosts();
  if (topPosts.length === 0) return null;

  // MD 파일에서 포스트 메타데이터를 가져와 slug → title 매핑
  const allPosts = getSortedPostsData();
  const postMap = new Map(allPosts.map((p) => [p.slug, p.title]));

  // 제목을 찾을 수 있는 포스트만 표시
  const entries = topPosts
    .map((tp, i) => ({
      rank: i + 1,
      slug: tp.slug,
      title: postMap.get(tp.slug),
      views: tp.views,
    }))
    .filter((e) => e.title);

  if (entries.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold tracking-wide text-slate-400 mb-6">
        인기 글
      </h2>
      <ol className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <li key={entry.slug} className="flex items-baseline gap-4 py-3 group">
            <span className="text-2xl font-black text-blue-600/30 tabular-nums leading-none select-none">
              {String(entry.rank).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <Link
                href={`/blog/${entry.slug}`}
                className="text-sm font-bold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1"
              >
                {entry.title}
              </Link>
            </div>
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
              {entry.views.toLocaleString()} 조회
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
