import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

export const metadata: Metadata = {
    title: '문의하기 - Contact',
    description: 'Ilsanggam Life Studio에 궁금한 점이나 제안사항이 있으시면 문의해주세요. 빠른 시일 내에 답변드리겠습니다.',
    alternates: { canonical: '/contact' },
    openGraph: {
        title: '문의하기 - Ilsanggam Life Studio',
        description: '궁금한 점이나 제안사항이 있으시면 문의해주세요.',
        url: `${siteUrl}/contact`,
        images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: 'Contact Ilsanggam Life Studio' }],
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
