'use client';

import { useEffect, useState } from 'react';

type Stats = Record<string, { views: number; comments: number }>;

// 모듈 레벨 캐시: 같은 페이지의 모든 인스턴스가 1번만 fetch
let statsCache: Stats | null = null;
let fetchPromise: Promise<Stats> | null = null;

function getAllStats(): Promise<Stats> {
    if (statsCache) return Promise.resolve(statsCache);
    if (fetchPromise) return fetchPromise;

    fetchPromise = fetch('/api/stats')
        .then(res => res.json())
        .then((data: Stats) => {
            statsCache = data;
            setTimeout(() => { statsCache = null; fetchPromise = null; }, 30000);
            return data;
        })
        .catch(() => {
            fetchPromise = null;
            return {} as Stats;
        });

    return fetchPromise;
}

export default function LivePostStats({ slug, variant = 'compact' }: { slug: string; variant?: 'compact' | 'featured' }) {
    const [views, setViews] = useState<number>(0);
    const [comments, setComments] = useState<number>(0);

    useEffect(() => {
        getAllStats().then(stats => {
            const s = stats[slug];
            if (s) {
                setViews(s.views);
                setComments(s.comments);
            }
        });
    }, [slug]);

    if (variant === 'featured') {
        return (
            <>
                <span className="flex items-center gap-1">
                    👁 {views.toLocaleString()} Views
                </span>
                <span>|</span>
                <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
                    💬 {comments} Comments
                </span>
            </>
        );
    }

    return (
        <>
            <span>👁 {views.toLocaleString()}</span>
            <span>•</span>
            <span>💬 {comments}</span>
        </>
    );
}
