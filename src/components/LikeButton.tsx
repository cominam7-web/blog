'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface LikeButtonProps {
    slug: string;
}

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !key) return null;
    return createClient(url, key);
}

export default function LikeButton({ slug }: LikeButtonProps) {
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const likedSlugs: string[] = JSON.parse(localStorage.getItem('liked_posts') || '[]');
        setLiked(likedSlugs.includes(slug));

        const supabase = getSupabase();
        if (!supabase) return;

        supabase
            .from('posts')
            .select('likes')
            .eq('slug', slug)
            .single()
            .then(({ data }) => {
                if (data?.likes) setLikes(data.likes);
            });
    }, [slug]);

    const handleLike = async () => {
        if (liked || loading) return;
        setLoading(true);

        const supabase = getSupabase();
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Optimistic update
        setLikes(prev => prev + 1);
        setLiked(true);

        const likedSlugs: string[] = JSON.parse(localStorage.getItem('liked_posts') || '[]');
        localStorage.setItem('liked_posts', JSON.stringify([...likedSlugs, slug]));

        try {
            await supabase.rpc('increment_likes', { post_slug: slug });
        } catch {
            // Revert on error
            setLikes(prev => prev - 1);
            setLiked(false);
            const reverted = likedSlugs.filter(s => s !== slug);
            localStorage.setItem('liked_posts', JSON.stringify(reverted));
        }

        setLoading(false);
    };

    return (
        <button
            onClick={handleLike}
            disabled={liked || loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                liked
                    ? 'bg-red-50 text-red-500 border border-red-200 cursor-default'
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer'
            }`}
            aria-label={liked ? '좋아요 완료' : '좋아요'}
        >
            <span className={`transition-transform ${liked ? 'scale-125' : ''}`}>
                {liked ? '❤️' : '🤍'}
            </span>
            <span>도움이 됐어요</span>
            {likes > 0 && <span className="text-xs">({likes})</span>}
        </button>
    );
}
