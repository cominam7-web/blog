'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

type Stats = Record<string, { views: number; comments: number }>;

// 모듈 레벨 캐시: 같은 페이지의 모든 인스턴스가 1번만 fetch
let statsCache: Stats | null = null;
let fetchPromise: Promise<Stats> | null = null;
let isAdminCache: boolean | null = null;
let adminCheckPromise: Promise<boolean> | null = null;

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

function checkIsAdmin(): Promise<boolean> {
    if (isAdminCache !== null) return Promise.resolve(isAdminCache);
    if (adminCheckPromise) return adminCheckPromise;

    adminCheckPromise = getSupabase().auth.getUser()
        .then(({ data }) => {
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            isAdminCache = !!(data.user && adminEmail && data.user.email === adminEmail);
            return isAdminCache;
        })
        .catch(() => {
            isAdminCache = false;
            return false;
        });

    return adminCheckPromise;
}

export default function LivePostStats({ slug, variant = 'compact' }: { slug: string; variant?: 'compact' | 'featured' }) {
    const [views, setViews] = useState<number>(0);
    const [comments, setComments] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        getAllStats().then(stats => {
            const s = stats[slug];
            if (s) {
                setViews(s.views);
                setComments(s.comments);
            }
        });
        checkIsAdmin().then(setIsAdmin);
    }, [slug]);

    if (variant === 'featured') {
        return (
            <>
                {isAdmin && (
                    <>
                        <span className="flex items-center gap-1">
                            👁 {views.toLocaleString()} Views
                        </span>
                        <span>|</span>
                    </>
                )}
                <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
                    💬 {comments} Comments
                </span>
            </>
        );
    }

    return (
        <>
            {isAdmin && (
                <>
                    <span>👁 {views.toLocaleString()}</span>
                    <span>•</span>
                </>
            )}
            <span>💬 {comments}</span>
        </>
    );
}
