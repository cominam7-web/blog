'use client';

import { useEffect, useRef } from 'react';

interface CoupangBannerProps {
    className?: string;
}

export default function CoupangBanner({ className = '' }: CoupangBannerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current || !containerRef.current) return;
        loadedRef.current = true;

        const container = containerRef.current;

        // 1. 쿠팡 파트너스 SDK 로드
        const sdkScript = document.createElement('script');
        sdkScript.src = 'https://ads-partners.coupang.com/g.js';
        sdkScript.async = true;
        container.appendChild(sdkScript);

        // 2. SDK 로드 후 배너 초기화
        sdkScript.onload = () => {
            const initScript = document.createElement('script');
            initScript.textContent = `new PartnersCoupang.G({"id":971382,"template":"carousel","trackingCode":"AF8589290","width":"100%","height":"200","tsource":""});`;
            container.appendChild(initScript);
        };
    }, []);

    return (
        <div className={`my-6 ${className}`}>
            <div ref={containerRef} className="flex justify-center overflow-hidden rounded-lg" />
            <p className="mt-2 text-center text-xs text-slate-400">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
}
