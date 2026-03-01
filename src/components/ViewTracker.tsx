'use client';

import { useEffect } from 'react';

// 포스트 페이지 방문 시 조회수를 자동으로 +1 (세션당 1회만)
export default function ViewTracker({ slug }: { slug: string }) {
    useEffect(() => {
        // sessionStorage로 새로고침 중복 카운트 방지
        const key = `viewed_${slug}`;
        if (sessionStorage.getItem(key)) return;

        fetch('/api/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
        })
            .then(() => {
                sessionStorage.setItem(key, '1');
            })
            .catch(() => {
                // 실패해도 UX에 영향 없음
            });
    }, [slug]);

    return null; // 렌더링 없음
}
