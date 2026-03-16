'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NewsletterForm from '@/components/NewsletterForm';

export default function Footer() {
    const pathname = usePathname();

    // admin 페이지에서는 footer 숨김
    if (pathname.startsWith('/admin')) return null;

    return (
        <footer className="bg-white border-t border-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Guides */}
                <div className="mb-8 pb-8 border-b border-slate-100">
                    <p className="text-xs font-bold tracking-wide text-slate-400 mb-3">종합 가이드</p>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/guide/money-saving-hacks" className="text-sm px-4 py-2 bg-slate-50 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">생활 꿀팁 총정리</Link>
                        <Link href="/guide/smart-tech-guide" className="text-sm px-4 py-2 bg-slate-50 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">스마트 테크 가이드</Link>
                        <Link href="/guide/health-wellness-guide" className="text-sm px-4 py-2 bg-slate-50 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">건강 관리 가이드</Link>
                        <Link href="/guide/entertainment-picks" className="text-sm px-4 py-2 bg-slate-50 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">엔터테인먼트 추천</Link>
                    </div>
                </div>

                {/* Newsletter */}
                <NewsletterForm variant="inline" className="mb-8 pb-8 border-b border-slate-100" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} 일상감 라이프 스튜디오. All rights reserved.
                </div>

                <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600 flex-wrap justify-center">
                    <Link href="/" className="hover:text-blue-600 transition-colors py-1">
                        홈
                    </Link>
                    <Link href="/about" className="hover:text-blue-600 transition-colors py-1">
                        소개
                    </Link>
                    <Link href="/contact" className="hover:text-blue-600 transition-colors py-1">
                        문의
                    </Link>
                    <Link href="/privacy" className="hover:text-blue-600 transition-colors py-1">
                        개인정보
                    </Link>
                    <Link href="/terms" className="hover:text-blue-600 transition-colors py-1">
                        이용약관
                    </Link>
                </nav>
                </div>
            </div>
        </footer>
    );
}
