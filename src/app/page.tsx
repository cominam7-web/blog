import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            My AI Auto Blog
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Make + Supabase + GitHub 자동화로 운영되는 블로그입니다.
          </p>
        </header>

        <section className="space-y-8">
          {allPostsData.map(({ slug, date, title, excerpt }) => (
            <article key={slug} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <Link href={`/blog/${slug}`}>
                <h2 className="text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                  {title}
                </h2>
              </Link>
              <p className="text-sm text-slate-500 mt-1">{date}</p>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {excerpt}
              </p>
              <div className="mt-4">
                <Link href={`/blog/${slug}`} className="text-blue-600 font-medium hover:underline">
                  더 읽어보기 →
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
