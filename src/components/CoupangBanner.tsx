'use client';

interface CoupangBannerProps {
    campaignId?: string;
    keyword?: string;
    className?: string;
}

export default function CoupangBanner({ campaignId, keyword, className = '' }: CoupangBannerProps) {
    const partnersId = process.env.NEXT_PUBLIC_COUPANG_PARTNERS_ID;

    if (!partnersId) return null;

    let targetUrl: string;
    if (campaignId) {
        const url = new URL(`https://link.coupang.com/a/${campaignId}`);
        url.searchParams.set('sid', partnersId);
        if (keyword) url.searchParams.set('keyword', keyword);
        targetUrl = url.toString();
    } else {
        // 키워드가 있으면 검색 결과로, 없으면 베스트 카테고리로 이동
        const searchKeyword = keyword || '생활용품 베스트';
        targetUrl = `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(searchKeyword)}&channel=user`;
    }

    return (
        <div className={`my-6 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-5 ${className}`}>
            <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex flex-col items-center gap-3 text-center no-underline"
            >
                <span className="text-2xl">🛒</span>
                <span className="text-lg font-semibold text-slate-800">
                    {keyword && !/베스트$/.test(keyword)
                        ? `"${keyword}" 관련 추천 상품`
                        : '추천 상품 보러가기'}
                </span>
                <span className="inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    쿠팡에서 확인하기
                </span>
            </a>
            <p className="mt-3 text-center text-xs text-slate-400">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
}
