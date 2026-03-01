'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';
import { adminFetch } from '@/lib/admin-fetch';

export default function EditPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        adminFetch(`/api/admin/posts/${slug}`)
            .then(async (res) => {
                if (!res.ok) {
                    setError('Post not found');
                    return;
                }
                const data = await res.json();
                setInitialData(data);
            })
            .catch(() => setError('Failed to load post'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-slate-400 text-sm">Loading post from GitHub...</p>
            </div>
        );
    }

    if (error || !initialData) {
        return (
            <div className="p-8">
                <p className="text-red-500 text-sm">{error || 'Post not found'}</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Edit Post</h1>
            <p className="text-xs text-slate-400 mb-8 font-mono">{slug}</p>
            <PostEditor mode="edit" initialData={initialData} />
        </div>
    );
}
