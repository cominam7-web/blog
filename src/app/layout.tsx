import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ilsanggam Life Studio | 최고의 생활 정보 저장소",
    template: "%s | Ilsanggam Life Studio"
  },
  description: "Ilsanggam Life Studio는 전문적인 생활 정보와 라이프스타일 팁을 AI 기술로 자동화하여 전달하는 프리미엄 블로그입니다.",
  keywords: ["Ilsanggam Life Studio", "생활 정보", "라이프스타일", "AI 블로그", "일상감"],
  authors: [{ name: "Ilsanggam Life Studio" }],
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  verification: {
    google: "google3019d64a5a71b97e",
    other: {
      "naver-site-verification": ["7b67d40bb0f551ce92c6af50b38975c1eb1fbb96"],
    },
  },
  openGraph: {
    title: "Ilsanggam Life Studio | 최고의 생활 정보 저장소",
    description: "전문적인 생활 정보와 라이프스타일 팁을 제공하는 프리미엄 자동화 블로그",
    type: "website",
    locale: "ko_KR",
    siteName: "Ilsanggam Life Studio",
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ilsanggam Life Studio | 최고의 생활 정보 저장소",
    description: "전문적인 생활 정보와 라이프스타일 팁을 제공하는 프리미엄 자동화 블로그",
  },
};

import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} font-sans antialiased selection:bg-blue-100 selection:text-blue-900`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
