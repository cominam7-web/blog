'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

type Stats = Record<string, { views: number; comments: number }>;

// ── 통계 캐시 ──
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

// ── 어드민 감지 (onAuthStateChange 기반) ──
let adminResolved = false;
let adminValue = false;
const adminListeners = new Set<(v: boolean) => void>();
let adminInitialized = false;

function initAdminListener() {
    if (adminInitialized) return;
    adminInitialized = true;

    const supabase = getSupabase();
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    const update = (email: string | undefined) => {
        const val = !!(email && adminEmail && email === adminEmail);
        adminValue = val;
        adminResolved = true;
        adminListeners.forEach(cb => cb(val));
    };

    // 초기 체크
    supabase.auth.getUser().then(({ data }) => {
        update(data.user?.email);
    });

    // 로그인/로그아웃 감지
    supabase.auth.onAuthStateChange((_event, session) => {
        update(session?.user?.email);
    });
}

function onAdminChange(callback: (isAdmin: boolean) => void): () => void {
    initAdminListener();
    adminListeners.add(callback);
    if (adminResolved) {
        callback(adminValue);
    }
    return () => { adminListeners.delete(callback); };
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
        const unsub = onAdminChange(setIsAdmin);
        return unsub;
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
