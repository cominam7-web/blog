import Link from 'next/link';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

export const metadata: Metadata = {
    title: 'About - 일상감 라이프 스튜디오 소개',
    description: '일상감 라이프 스튜디오는 건강, 생활 꿀팁, 테크, 엔터테인먼트까지 일상에 감각을 더하는 실용 정보 블로그입니다.',
    alternates: { canonical: '/about' },
    openGraph: {
        title: 'About - 일상감 라이프 스튜디오 소개',
        description: '건강, 생활 꿀팁, 테크, 엔터테인먼트까지 일상에 감각을 더하는 실용 정보 블로그',
        url: `${siteUrl}/about`,
        images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: 'About Ilsanggam Life Studio' }],
    },
};

export default function About() {
    const orgSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '일상감 라이프 스튜디오',
        alternateName: 'Ilsanggam Life Studio',
        url: siteUrl,
        description: '건강, 생활 꿀팁, 테크, 엔터테인먼트까지 일상에 감각을 더하는 실용 정보 블로그',
        foundingDate: '2026',
        email: 'isglifestudio@gmail.com',
        sameAs: [],
    };

    return (
        <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
            />
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb Section */}
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-8 uppercase">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <span>→</span>
                    <span className="text-blue-600">About</span>
                </div>

                <header className="mb-12 pb-8 border-b border-dashed border-slate-300">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                        About Ilsanggam Life Studio
                    </h1>
                </header>

                <div className="prose prose-slate lg:prose-xl max-w-none prose-headings:text-slate-950 prose-strong:text-slate-900 leading-relaxed font-medium">
                    <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                        안녕하세요! <strong>일상감 라이프 스튜디오</strong>에 오신 것을 환영합니다.
                        &apos;일상의 감각&apos;이라는 이름처럼, 매일 스쳐 지나가는 정보 속에서 진짜 쓸모 있는 것만 골라 전해드리는 블로그입니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12">우리의 철학</h3>
                    <p>
                        &quot;몰라서 못 받는 돈, 몰라서 못 누리는 혜택&quot;이 너무 많습니다.
                        일상감 라이프 스튜디오는 복잡한 정보를 쉽게 풀어서, 읽는 즉시 행동할 수 있는 실용적인 가이드를 제공합니다.
                        검증된 정보만 다루고, 확실하지 않은 내용은 쓰지 않는 것이 우리의 원칙입니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12">다루는 주제</h3>
                    <ul className="space-y-4">
                        <li><strong className="text-blue-600">생활정보 (Hacks)</strong>: 정부 지원금, 세금 환급, 절약 팁 등 모르면 손해 보는 꿀정보</li>
                        <li><strong className="text-blue-600">건강 (Health)</strong>: 건강검진 활용법, 의료비 절약, 운동·영양 등 내 몸을 지키는 실전 가이드</li>
                        <li><strong className="text-blue-600">테크 (Tech)</strong>: 유용한 앱 추천, 디지털 보안, 생산성 도구 등 스마트한 디지털 생활</li>
                        <li><strong className="text-blue-600">엔터테인먼트 (Entertainment)</strong>: 정주행 추천 드라마, 영화 리뷰, K-POP 등 즐길 거리</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12">콘텐츠 제작 과정</h3>
                    <p>
                        일상감 라이프 스튜디오의 모든 콘텐츠는 다음과 같은 과정을 거쳐 제작됩니다:
                    </p>
                    <ol className="space-y-3">
                        <li><strong>주제 선정</strong>: 실제 독자들이 궁금해하는 트렌드와 생활 밀착형 주제를 리서치합니다.</li>
                        <li><strong>자료 조사</strong>: 정부 공식 사이트, 학술 자료, 전문가 의견 등 신뢰할 수 있는 출처를 확인합니다.</li>
                        <li><strong>콘텐츠 작성</strong>: AI 기술을 활용하여 초안을 작성하고, 편집팀이 팩트체크와 교정을 진행합니다.</li>
                        <li><strong>품질 검수</strong>: 정보의 정확성, 가독성, 실용성을 기준으로 최종 검수 후 발행합니다.</li>
                    </ol>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12">왜 일상감인가요?</h3>
                    <p>
                        하루에도 수백 개의 정보가 쏟아지지만, 정작 내 생활에 도움이 되는 건 몇 개 안 됩니다.
                        저희는 직접 조사하고, 공식 사이트를 확인하고, 실제로 도움이 되는 정보만 엄선합니다.
                        &quot;이 글 하나 읽었더니 진짜 돈 아꼈다&quot;는 말이 저희의 최고 칭찬입니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12">운영 정보</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-sm p-6 not-prose">
                        <dl className="space-y-3 text-sm">
                            <div className="flex gap-2">
                                <dt className="font-bold text-slate-900 min-w-[80px]">사이트명</dt>
                                <dd className="text-slate-600">일상감 라이프 스튜디오 (Ilsanggam Life Studio)</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-bold text-slate-900 min-w-[80px]">운영</dt>
                                <dd className="text-slate-600">일상감 라이프 스튜디오 편집팀</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-bold text-slate-900 min-w-[80px]">이메일</dt>
                                <dd className="text-slate-600">isglifestudio@gmail.com</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-bold text-slate-900 min-w-[80px]">설립</dt>
                                <dd className="text-slate-600">2026년</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="font-bold text-slate-900 min-w-[80px]">분야</dt>
                                <dd className="text-slate-600">생활정보, 건강, 테크, 엔터테인먼트</dd>
                            </div>
                        </dl>
                    </div>

                    <p className="mt-12 pt-8 border-t border-dashed border-slate-200 text-slate-600 italic">
                        궁금한 점이나 다뤄줬으면 하는 주제가 있다면{' '}
                        <Link href="/contact" className="text-blue-600 not-italic font-bold hover:underline">문의 페이지</Link>
                        를 통해 언제든 연락해 주세요.
                        여러분의 일상에 감각을 더하는 블로그가 되겠습니다.
                    </p>
                </div>
            </div>
        </main>
    );
}
