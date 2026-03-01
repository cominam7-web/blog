'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
    totalPosts: number;
    totalViews: number;
    totalComments: number;
    topPosts: { slug: string; title: string; views: number }[];
    recentComments: { id: string; user_name: string; content: string; slug: string; created_at: string }[];
    recentPosts: { slug: string; title: string; status: string; created_at: string }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Dashboard</h1>
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Dashboard</h1>
                <div className="text-red-500">Failed to load stats</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Posts</p>
                    <p className="text-3xl font-black text-slate-900">{stats.totalPosts}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Views</p>
                    <p className="text-3xl font-black text-slate-900">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Comments</p>
                    <p className="text-3xl font-black text-slate-900">{stats.totalComments}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Posts */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">
                        Top Posts by Views
                    </h2>
                    {stats.topPosts.length > 0 ? (
                        <ul className="space-y-3">
                            {stats.topPosts.map((post, i) => (
                                <li key={post.slug} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                                        <Link href={`/admin/posts/${post.slug}/edit`} className="text-sm text-slate-700 hover:text-blue-600 truncate">
                                            {post.title}
                                        </Link>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 flex-shrink-0 ml-3">
                                        {(post.views || 0).toLocaleString()} views
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No data yet</p>
                    )}
                </div>

                {/* Recent Comments */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">
                        Recent Comments
                    </h2>
                    {stats.recentComments.length > 0 ? (
                        <ul className="space-y-3">
                            {stats.recentComments.map((comment) => (
                                <li key={comment.id} className="border-b border-slate-100 pb-2 last:border-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-700">{comment.user_name}</span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1">{comment.content}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No comments yet</p>
                    )}
                </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mt-8">
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Posts</h2>
                    <Link href="/admin/posts" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                </div>
                {stats.recentPosts.length > 0 ? (
                    <ul className="space-y-2">
                        {stats.recentPosts.map((post) => (
                            <li key={post.slug} className="flex items-center justify-between py-1.5">
                                <Link href={`/admin/posts/${post.slug}/edit`} className="text-sm text-slate-700 hover:text-blue-600 truncate flex-1 min-w-0 mr-4">
                                    {post.title}
                                </Link>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {post.status}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-400 italic">No posts yet</p>
                )}
            </div>
        </div>
    );
}
