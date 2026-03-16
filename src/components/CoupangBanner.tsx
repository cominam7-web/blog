'use client';

interface CoupangBannerProps {
    className?: string;
}

// AdSense 승인 전까지 쿠팡 배너 비활성화
// 승인 후 NEXT_PUBLIC_ENABLE_COUPANG=true 환경변수를 설정하면 다시 활성화됩니다.
const ENABLE_COUPANG = process.env.NEXT_PUBLIC_ENABLE_COUPANG === 'true';

export default function CoupangBanner({ className = '' }: CoupangBannerProps) {
    if (!ENABLE_COUPANG) return null;

    return (
        <div className={`my-6 ${className}`}>
            <iframe
                src="https://ads-partners.coupang.com/widgets.html?id=971382&template=carousel&trackingCode=AF8589290&subId=&width=100%25&height=200&tsource="
                width="100%"
                height="200"
                frameBorder="0"
                scrolling="no"
                referrerPolicy="unsafe-url"
                style={{ border: 'none' }}
            />
            <p className="mt-2 text-center text-xs text-slate-400">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
}
