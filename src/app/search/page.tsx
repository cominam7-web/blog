import { searchPosts, resolveNanobanana } from '@/lib/posts';
import Link from 'next/link';
import { Suspense } from 'react';

async function SearchResults({ query }: { query: string }) {
    const rawResults = query ? searchPosts(query) : [];

    // Resolve Nanobanana images for results
    const results = rawResults.map(post => ({
        ...post,
        image: resolveNanobanana(post.image || '')
    }));

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Search Header */}
                <div className="border-b-2 border-slate-900 pb-8 mb-12">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Search Results</p>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase">
                        {query ? `"${query}"` : 'All Stories'}
                    </h1>
                    <p className="mt-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
                    </p>
                </div>

                {/* Results Grid */}
                {results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-12">
                        {results.map((post) => (
                            <article key={post.slug} className="group border-b border-dashed border-slate-200 pb-12 last:border-0 flex flex-col md:flex-row gap-8">
                                <Link href={`/blog/${post.slug}`} className="md:w-1/3 aspect-video overflow-hidden rounded-sm bg-slate-50 flex-shrink-0">
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
                                <div className="flex-grow space-y-4">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{post.category}</p>
                                    <Link href={`/blog/${post.slug}`}>
                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight uppercase">
                                            {post.title}
                                        </h2>
                                    </Link>
                                    <p className="text-slate-500 text-base leading-relaxed line-clamp-2 italic">
                                        {post.excerpt}
                                    </p>
                                    <div className="pt-2 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>0 Comments</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                        <div className="text-4xl mb-6">🔍</div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">No results found</h2>
                        <p className="text-slate-400 font-medium italic mb-8">Try adjusting your search keywords or explore categories.</p>
                        <Link href="/" className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q: string }>
}) {
    const { q } = await searchParams;
    const query = q || '';

    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><span className="text-slate-400 font-black uppercase tracking-widest animate-pulse">Searching...</span></div>}>
            <SearchResults query={query} />
        </Suspense>
    );
}
