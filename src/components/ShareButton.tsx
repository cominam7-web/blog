'use client';

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';

interface ShareButtonProps {
    title?: string;
    description?: string;
    imageUrl?: string;
}

declare global {
    interface Window {
        Kakao?: {
            init: (appKey: string) => void;
            isInitialized: () => boolean;
            Share: {
                sendDefault: (settings: Record<string, unknown>) => void;
            };
        };
    }
}

export default function ShareButton({ title, description, imageUrl }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [instaToast, setInstaToast] = useState(false);
    const [kakaoReady, setKakaoReady] = useState(false);

    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY || '';

    const getShareUrl = () => (typeof window !== 'undefined' ? window.location.href : '');
    const getShareTitle = () => title || (typeof document !== 'undefined' ? document.title : '');

    // Kakao SDK 로드 완료 시 초기화
    const handleKakaoLoad = useCallback(() => {
        if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized() && kakaoAppKey) {
            window.Kakao.init(kakaoAppKey);
            setKakaoReady(true);
        }
    }, [kakaoAppKey]);

    // 이미 로드된 경우 초기화
    useEffect(() => {
        handleKakaoLoad();
    }, [handleKakaoLoad]);

    const handleKakaoShare = useCallback(() => {
        if (!window.Kakao?.Share) return;

        const url = getShareUrl();
        const shareTitle = getShareTitle();

        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: shareTitle,
                description: description || '',
                imageUrl: imageUrl || '',
                link: {
                    mobileWebUrl: url,
                    webUrl: url,
                },
            },
        });
    }, [title, description, imageUrl]);

    const handleTwitterShare = () => {
        const url = getShareUrl();
        const text = getShareTitle();
        window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            'twitter-share',
            'width=600,height=400'
        );
    };

    const handleFacebookShare = () => {
        const url = getShareUrl();
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            'facebook-share',
            'width=600,height=400'
        );
    };

    const handleInstagramShare = async () => {
        const url = getShareUrl();
        const shareTitle = getShareTitle();

        // 모바일 감지 (터치 디바이스)
        const isMobile = typeof navigator !== 'undefined' &&
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
            // 모바일: Web Share API → 시스템 공유 시트 (인스타 DM/스토리 선택 가능)
            try {
                await navigator.share({
                    title: shareTitle,
                    text: description || shareTitle,
                    url: url,
                });
                return;
            } catch {
                // 사용자가 공유 취소 시 fallback
            }
        }

        // 데스크탑 & fallback: 링크 복사 + 안내 토스트
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setInstaToast(true);
        setTimeout(() => setInstaToast(false), 2500);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            const input = document.createElement('input');
            input.value = window.location.href;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <>
            {kakaoAppKey && (
                <Script
                    src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
                    strategy="lazyOnload"
                    onLoad={handleKakaoLoad}
                />
            )}
            <div className="relative flex items-center gap-2">
                {/* 카카오톡 */}
                {kakaoAppKey && (
                    <button
                        onClick={handleKakaoShare}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                        style={{ backgroundColor: '#FEE500' }}
                        title="카카오톡 공유"
                        aria-label="카카오톡으로 공유"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E">
                            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.65 1.753 4.992 4.416 6.376l-1.128 4.147a.5.5 0 00.768.544l4.87-3.214c.357.031.718.047 1.074.047 5.523 0 10-3.463 10-7.9S17.523 3 12 3z" />
                        </svg>
                    </button>
                )}

                {/* X (트위터) */}
                <button
                    onClick={handleTwitterShare}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{ backgroundColor: '#000000' }}
                    title="X(트위터) 공유"
                    aria-label="X(트위터)로 공유"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </button>

                {/* 페이스북 */}
                <button
                    onClick={handleFacebookShare}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{ backgroundColor: '#1877F2' }}
                    title="페이스북 공유"
                    aria-label="페이스북으로 공유"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </button>

                {/* 인스타그램 */}
                <button
                    onClick={handleInstagramShare}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{
                        background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)',
                    }}
                    title="인스타그램 공유"
                    aria-label="인스타그램으로 공유"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                </button>

                {/* 인스타그램 토스트 메시지 (화면 하단 고정) */}
                {instaToast && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl whitespace-nowrap z-[9999] animate-fade-in">
                        📋 링크가 복사되었어요! 인스타그램에 붙여넣기 해주세요
                    </div>
                )}

                {/* 링크 복사 */}
                <button
                    onClick={handleCopyLink}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-70"
                    style={{ backgroundColor: copied ? '#16a34a' : '#475569' }}
                    title={copied ? '복사됨!' : '링크 복사'}
                    aria-label="링크 복사"
                >
                    {copied ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                        </svg>
                    )}
                </button>
            </div>
        </>
    );
}
