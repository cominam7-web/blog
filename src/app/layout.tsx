import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

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
  description: "일상감 라이프 스튜디오는 건강, 생활 꿀팁, 테크, 엔터테인먼트까지 일상에 감각을 더하는 실용 정보 블로그입니다.",
  keywords: ["일상감 라이프 스튜디오", "생활 정보", "라이프스타일", "건강 정보", "일상감", "생활 꿀팁", "정부 지원금", "절약", "테크", "엔터테인먼트"],
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
      "msvalidate.01": ["C550A62A5A093247AE67ED0859653CB1"],
    },
  },
  openGraph: {
    title: "Ilsanggam Life Studio | 최고의 생활 정보 저장소",
    description: "건강, 생활 꿀팁, 테크, 엔터테인먼트까지 일상에 감각을 더하는 실용 정보 블로그",
    type: "website",
    locale: "ko_KR",
    siteName: "Ilsanggam Life Studio",
    url: siteUrl,
    images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: 'Ilsanggam Life Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ilsanggam Life Studio | 최고의 생활 정보 저장소",
    description: "건강, 생활 꿀팁, 테크, 엔터테인먼트까지 일상에 감각을 더하는 실용 정보 블로그",
    images: ['/og-default.svg'],
  },
  other: {
    'theme-color': '#0f172a',
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
      <head>
        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_path:window.location.pathname});`}
            </Script>
          </>
        )}
        {/* Google AdSense */}
        {adsenseId && (
          <>
            <meta name="google-adsense-account" content={adsenseId} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
              crossOrigin="anonymous"
            />
          </>
        )}
      </head>
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
