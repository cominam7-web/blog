'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PostStats({ slug }: { slug: string }) {
    const [views, setViews] = useState<number>(0);
    const [commentCount, setCommentCount] = useState<number>(0);

    useEffect(() => {
        supabase
            .from('posts')
            .select('views')
            .eq('slug', slug)
            .single()
            .then(({ data }) => {
                if (data) setViews(data.views ?? 0);
            });

        supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('slug', slug)
            .then(({ count }) => {
                setCommentCount(count ?? 0);
            });
    }, [slug]);

    return (
        <>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-2 uppercase tracking-wider">
                👁 {views.toLocaleString()} Views
            </span>
            <span className="text-slate-300">|</span>
            <a
                href="#comments"
                className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase tracking-wider"
            >
                💬 {commentCount} Comments
            </a>
        </>
    );
}
