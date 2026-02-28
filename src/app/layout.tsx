import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Auto Blog | 자동화된 지식 저장소",
    template: "%s | AI Auto Blog"
  },
  description: "Make, Supabase, GitHub로 운영되는 지식 자동화 블로그입니다. 전문적인 생활 정보를 실시간으로 제공합니다.",
  keywords: ["블로그 자동화", "AI 블로그", "생활 정보", "Next.js", "수익형 블로그"],
  authors: [{ name: "AI Blogger" }],
  openGraph: {
    title: "AI Auto Blog | 자동화된 지식 저장소",
    description: "Make, Supabase, GitHub로 운영되는 지식 자동화 블로그",
    type: "website",
    locale: "ko_KR",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-100 selection:text-blue-900`}
      >
        <div className="min-h-screen flex flex-col">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
