'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
    slug: string;
    title: string;
    excerpt: string;
    status: string;
    views: number;
    created_at: string;
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/posts')
            .then(r => r.json())
            .then(d => setPosts(d.posts || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (slug: string, title: string) => {
        if (!confirm(`"${title}" 글을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;

        setDeleting(slug);
        try {
            const res = await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p.slug !== slug));
            } else {
                alert('삭제 실패');
            }
        } catch {
            alert('삭제 중 오류 발생');
        }
        setDeleting(null);
    };

    const filtered = posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Posts</h1>
                <Link
                    href="/admin/posts/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    + New Post
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posts..."
                    className="w-full max-w-md border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {loading ? (
                <div className="text-slate-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="text-slate-400 py-12 text-center">No posts found</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Title</th>
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Status</th>
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 hidden md:table-cell">Views</th>
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 hidden md:table-cell">Date</th>
                                <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((post) => (
                                <tr key={post.slug} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link href={`/admin/posts/${post.slug}/edit`} className="text-sm font-medium text-slate-800 hover:text-blue-600 line-clamp-1">
                                            {post.title}
                                        </Link>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{post.slug}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {post.status || 'published'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                                        {(post.views || 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">
                                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                href={`/admin/posts/${post.slug}/edit`}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.slug, post.title)}
                                                disabled={deleting === post.slug}
                                                className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                            >
                                                {deleting === post.slug ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
