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
    default: "Ilsanggam Life Studio | 최고의 생활 정보 저장소",
    template: "%s | Ilsanggam Life Studio"
  },
  description: "Ilsanggam Life Studio는 전문적인 생활 정보와 라이프스타일 팁을 AI 기술로 자동화하여 전달하는 프리미엄 블로그입니다.",
  keywords: ["Ilsanggam Life Studio", "생활 정보", "라이프스타일", "AI 블로그", "수익형 블로그"],
  authors: [{ name: "Ilsanggam Team" }],
  openGraph: {
    title: "Ilsanggam Life Studio | 최고의 생활 정보 저장소",
    description: "전문적인 생활 정보와 라이프스타일 팁을 제공하는 프리미엄 자동화 블로그",
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
