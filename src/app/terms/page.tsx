import Link from 'next/link';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

export const metadata: Metadata = {
    title: '이용약관 - Terms of Service',
    description: '일상감 라이프 스튜디오 이용약관. 서비스 이용 조건, 콘텐츠 저작권, 면책 조항, 사용자 책임 안내.',
    alternates: { canonical: '/terms' },
    openGraph: {
        title: '이용약관 - Ilsanggam Life Studio',
        description: '서비스 이용약관 안내',
        url: `${siteUrl}/terms`,
    },
};

export default function Terms() {
    return (
        <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb Section */}
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-8 uppercase">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <span>→</span>
                    <span className="text-blue-600">Terms of Service</span>
                </div>

                <header className="mb-12 pb-8 border-b border-dashed border-slate-300">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                        Terms of Service
                    </h1>
                    <p className="mt-4 text-lg text-slate-500 font-medium">이용약관</p>
                </header>

                <div className="prose prose-slate lg:prose-xl max-w-none prose-headings:text-slate-950 prose-strong:text-slate-900 leading-relaxed font-medium">
                    <p className="text-slate-600 mb-10">
                        본 이용약관은 일상감 라이프 스튜디오(이하 &quot;본 서비스&quot;, isglifestudio.kr)의 이용에 관한 조건을 규정합니다.
                        본 서비스를 이용함으로써 아래 약관에 동의한 것으로 간주합니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제1조 (목적)</h3>
                    <p>
                        본 약관은 일상감 라이프 스튜디오가 제공하는 블로그 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여
                        서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제2조 (서비스의 내용)</h3>
                    <p>본 서비스는 다음과 같은 콘텐츠 및 기능을 제공합니다.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>생활정보, 건강, 기술, 엔터테인먼트 분야의 블로그 콘텐츠</li>
                        <li>뉴스레터 구독 서비스</li>
                        <li>댓글 및 커뮤니티 기능</li>
                        <li>종합 가이드 다운로드 서비스</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제3조 (이용 조건)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>본 서비스는 누구나 무료로 이용할 수 있습니다.</li>
                        <li>댓글 작성 등 일부 기능은 회원 가입 또는 게스트 인증이 필요할 수 있습니다.</li>
                        <li>이용자는 관련 법령, 본 약관, 서비스 이용 안내 및 공지사항을 준수하여야 합니다.</li>
                        <li>타인의 권리를 침해하거나 공공질서에 반하는 행위를 해서는 안 됩니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제4조 (콘텐츠 저작권)</h3>
                    <p>
                        본 서비스에 게시된 모든 콘텐츠(글, 이미지, 디자인 등)의 저작권은 일상감 라이프 스튜디오에 귀속됩니다.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>사전 서면 동의 없이 콘텐츠를 복제, 배포, 전송, 전시, 판매, 변형, 2차 저작물 작성에 이용할 수 없습니다.</li>
                        <li>개인적, 비상업적 목적으로 출처를 명시한 경우에 한해 인용이 가능합니다.</li>
                        <li>본 서비스의 일부 콘텐츠는 AI 기술을 활용하여 생성되며, 정확성을 보장하지 않습니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제5조 (사용자 생성 콘텐츠)</h3>
                    <p>
                        이용자가 댓글 등을 통해 게시한 콘텐츠에 대한 책임은 해당 이용자에게 있습니다.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>타인을 비방하거나 명예를 훼손하는 내용은 사전 통보 없이 삭제될 수 있습니다.</li>
                        <li>스팸, 광고, 악성 링크 등이 포함된 댓글은 삭제됩니다.</li>
                        <li>불법적이거나 부적절한 콘텐츠를 게시하는 이용자의 접근이 제한될 수 있습니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제6조 (면책 조항)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>본 서비스의 콘텐츠는 정보 제공 목적으로만 제공되며, 전문적인 의료, 법률, 재정 상담을 대체하지 않습니다.</li>
                        <li>콘텐츠의 정확성, 완전성, 적시성에 대해 보증하지 않으며, 콘텐츠 이용으로 인한 손해에 대해 책임을 지지 않습니다.</li>
                        <li>외부 링크를 통해 연결되는 제3자 사이트의 콘텐츠에 대해서는 책임을 지지 않습니다.</li>
                        <li>서비스 운영 중 발생하는 기술적 문제로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제7조 (광고 및 제휴)</h3>
                    <p>본 서비스는 다음과 같은 광고 및 제휴 프로그램을 운영할 수 있습니다.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Google AdSense를 통한 맞춤형 광고 표시</li>
                        <li>쿠팡 파트너스 등 제휴 마케팅 프로그램 참여</li>
                        <li>제휴 링크를 통한 구매 시 서비스 운영자에게 일정 수수료가 지급될 수 있습니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제8조 (서비스 변경 및 중단)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>서비스 운영자는 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
                        <li>서비스 변경 또는 중단 시 가능한 한 사전에 공지합니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제9조 (약관의 변경)</h3>
                    <p>
                        본 약관은 필요에 따라 변경될 수 있으며, 변경된 약관은 본 페이지에 게시함으로써 효력이 발생합니다.
                        중요한 변경 사항의 경우 서비스 내 공지를 통해 안내합니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제10조 (개인정보 보호)</h3>
                    <p>
                        이용자의 개인정보 보호에 관한 사항은{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline font-bold">개인정보처리방침</Link>을 따릅니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">제11조 (문의)</h3>
                    <p>
                        본 약관에 대한 문의사항은 아래 연락처로 문의해 주시기 바랍니다.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>이메일: <a href="mailto:isglifestudio@gmail.com" className="text-blue-600 hover:underline">isglifestudio@gmail.com</a></li>
                        <li>문의 페이지: <Link href="/contact" className="text-blue-600 hover:underline">문의하기</Link></li>
                    </ul>

                    <p className="mt-12 pt-8 border-t border-dashed border-slate-200 text-xs text-slate-400">시행일자: 2026년 3월 15일</p>
                </div>
            </div>
        </main>
    );
}
