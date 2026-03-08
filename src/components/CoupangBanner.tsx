'use client';

interface CoupangBannerProps {
    campaignId?: string;
    keyword?: string;
    className?: string;
}

export default function CoupangBanner({ campaignId, keyword, className = '' }: CoupangBannerProps) {
    const partnersId = process.env.NEXT_PUBLIC_COUPANG_PARTNERS_ID;

    if (!partnersId) return null;

    const baseUrl = campaignId
        ? `https://link.coupang.com/a/${campaignId}`
        : `https://www.coupang.com`;

    const url = new URL(baseUrl);
    url.searchParams.set('sid', partnersId);
    if (keyword) {
        url.searchParams.set('keyword', keyword);
    }

    return (
        <div className={`my-6 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 ${className}`}>
            <a
                href={url.toString()}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex flex-col items-center gap-3 text-center no-underline"
            >
                <span className="text-2xl">🛒</span>
                <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    추천 상품 보러가기
                </span>
                {keyword && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        &ldquo;{keyword}&rdquo; 관련 상품
                    </span>
                )}
                <span className="inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    쿠팡에서 확인하기
                </span>
            </a>
            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
}
