'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Comment {
    id: string;
    user_name: string;
    user_email: string;
    content: string;
    slug: string;
    created_at: string;
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/comments')
            .then(r => r.json())
            .then(d => setComments(d.comments || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('이 댓글을 삭제하시겠습니까?')) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== id));
            } else {
                alert('삭제 실패');
            }
        } catch {
            alert('삭제 중 오류 발생');
        }
        setDeleting(null);
    };

    return (
        <div className="p-8 max-w-6xl">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Comments</h1>

            {loading ? (
                <div className="text-slate-400">Loading...</div>
            ) : comments.length === 0 ? (
                <div className="text-slate-400 py-12 text-center">No comments yet</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Author</th>
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Comment</th>
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 hidden md:table-cell">Post</th>
                                <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Date</th>
                                <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((comment) => (
                                <tr key={comment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-slate-800">{comment.user_name}</p>
                                        <p className="text-[10px] text-slate-400">{comment.user_email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-600 line-clamp-2 max-w-xs">{comment.content}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <Link
                                            href={`/blog/${comment.slug}`}
                                            target="_blank"
                                            className="text-xs text-blue-600 hover:underline line-clamp-1 max-w-[200px]"
                                        >
                                            {comment.slug}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell whitespace-nowrap">
                                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={deleting === comment.id}
                                            className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {deleting === comment.id ? '...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-xs text-slate-400 mt-4">
                Total: {comments.length} comments
            </p>
        </div>
    );
}
