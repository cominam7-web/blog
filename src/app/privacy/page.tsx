import Link from 'next/link';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

export const metadata: Metadata = {
    title: '개인정보처리방침 - Privacy Policy',
    description: 'Ilsanggam Life Studio 개인정보처리방침. 수집 항목, 쿠키 정책, 제3자 광고 서비스, Google AdSense, 개인정보 보유 및 파기 안내.',
    alternates: { canonical: '/privacy' },
    openGraph: {
        title: '개인정보처리방침 - Ilsanggam Life Studio',
        description: '개인정보처리방침 및 쿠키 정책 안내',
        url: `${siteUrl}/privacy`,
    },
};

export default function Privacy() {
    return (
        <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb Section */}
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-8 uppercase">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <span>→</span>
                    <span className="text-blue-600">Privacy Policy</span>
                </div>

                <header className="mb-12 pb-8 border-b border-dashed border-slate-300">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-lg text-slate-500 font-medium">개인정보처리방침</p>
                </header>

                <div className="prose prose-slate lg:prose-xl max-w-none prose-headings:text-slate-950 prose-strong:text-slate-900 leading-relaxed font-medium">
                    <p className="text-slate-600 mb-10">
                        일상감 라이프 스튜디오(이하 &quot;본 서비스&quot;, isglifestudio.kr)는 이용자의 개인정보를 소중하게 생각하며,
                        「개인정보 보호법」 등 관련 법규를 준수합니다. 본 개인정보처리방침은 수집하는 정보의 종류, 이용 목적,
                        보관 기간 및 이용자의 권리를 안내합니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">1. 수집하는 개인정보 항목</h3>
                    <p>본 서비스는 다음과 같은 정보를 수집할 수 있습니다.</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-6 mb-3">가. 자동 수집 항목</h4>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>방문 일시, 접속 IP 주소, 브라우저 종류 및 버전</li>
                        <li>방문 페이지, 방문 경로(리퍼러), 체류 시간</li>
                        <li>기기 정보(운영체제, 화면 해상도 등)</li>
                        <li>쿠키 및 유사 기술을 통한 식별 정보</li>
                    </ul>
                    <h4 className="text-lg font-bold text-slate-800 mt-6 mb-3">나. 이용자 제공 항목</h4>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>회원 가입 시: 이메일 주소, 비밀번호, 닉네임(표시명)</li>
                        <li>소셜 로그인 시: 해당 플랫폼에서 제공하는 공개 프로필 정보(이름, 이메일, 프로필 사진)</li>
                        <li>댓글 작성 시: 이름(닉네임), 댓글 내용</li>
                        <li>뉴스레터 구독 시: 이메일 주소</li>
                        <li>문의하기 시: 이름, 이메일 주소, 문의 내용</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">2. 개인정보의 이용 목적</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>서비스 제공 및 운영: 콘텐츠 제공, 댓글 기능, 뉴스레터 발송</li>
                        <li>서비스 개선: 방문 통계 분석, 사용자 경험 최적화</li>
                        <li>광고 서비스: Google AdSense 등 맞춤형 광고 제공</li>
                        <li>문의 응대: 이용자 문의사항 처리 및 회신</li>
                        <li>부정 이용 방지: 스팸, 악성 활동 탐지 및 차단</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">3. 개인정보의 보유 및 파기</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>회원 정보: 회원 탈퇴 시 지체 없이 파기</li>
                        <li>댓글 정보: 댓글 삭제 요청 시 즉시 파기</li>
                        <li>뉴스레터 구독 정보: 구독 해지 시 즉시 파기</li>
                        <li>문의 정보: 문의 처리 완료 후 1년간 보관 후 파기</li>
                        <li>접속 로그: 통신비밀보호법에 따라 3개월간 보관</li>
                    </ul>
                    <p>원칙적으로 수집 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">4. 개인정보의 제3자 제공</h3>
                    <p>본 서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>이용자가 사전에 동의한 경우</li>
                        <li>법령에 의해 요구되는 경우</li>
                        <li>서비스 제공을 위해 필요한 범위 내에서 업무 위탁하는 경우</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">5. 쿠키(Cookie)의 사용</h3>
                    <p>본 서비스는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키를 사용합니다.</p>
                    <h4 className="text-lg font-bold text-slate-800 mt-6 mb-3">쿠키의 사용 목적</h4>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>이용자의 로그인 상태 유지</li>
                        <li>방문 빈도 및 이용 형태 분석 (Google Analytics)</li>
                        <li>맞춤형 광고 제공 (Google AdSense)</li>
                    </ul>
                    <h4 className="text-lg font-bold text-slate-800 mt-6 mb-3">쿠키의 거부</h4>
                    <p>
                        이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 쿠키를 거부할 경우
                        일부 서비스 이용에 제한이 있을 수 있습니다. 브라우저별 쿠키 설정 방법은 해당 브라우저의 도움말을 참고하시기 바랍니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">6. Google AdSense 및 광고 관련 정보</h3>
                    <p>본 서비스는 Google AdSense를 통해 광고를 게재하고 있습니다.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Google 및 제3자 광고 업체는 이용자의 이전 방문 기록을 기반으로 쿠키를 사용하여 관련성 있는 광고를 표시할 수 있습니다.</li>
                        <li>Google의 광고 쿠키를 사용하면 Google 및 파트너가 이용자의 본 사이트 또는 다른 사이트 방문 기록을 기반으로 광고를 게재할 수 있습니다.</li>
                        <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google 광고 설정</a>에서 맞춤 광고를 비활성화할 수 있습니다.</li>
                        <li>또한 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aboutads.info</a>를 방문하여 제3자 업체의 맞춤 광고에 사용되는 쿠키를 비활성화할 수 있습니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">7. Google Analytics</h3>
                    <p>
                        본 서비스는 웹사이트 트래픽을 분석하기 위해 Google Analytics를 사용합니다.
                        Google Analytics는 쿠키를 통해 이용자의 사이트 이용 정보를 수집하며,
                        이 정보는 Google의 개인정보처리방침에 따라 처리됩니다.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>수집 정보: 페이지 조회, 세션 시간, 이용 기기, 유입 경로 등</li>
                        <li>이용자는 <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics 차단 브라우저 부가 기능</a>을 설치하여 수집을 거부할 수 있습니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">8. 제휴 마케팅 프로그램</h3>
                    <p>
                        본 서비스는 쿠팡 파트너스 등 제휴 마케팅 프로그램에 참여하고 있습니다.
                        제휴 링크를 통한 구매 시 서비스 운영자에게 일정액의 수수료가 지급될 수 있습니다.
                        제휴 링크는 이용자의 구매 가격에 영향을 미치지 않습니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">9. 이용자의 권리</h3>
                    <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>개인정보 열람, 정정, 삭제 요청</li>
                        <li>개인정보 처리 정지 요청</li>
                        <li>회원 탈퇴 요청</li>
                        <li>뉴스레터 구독 해지</li>
                    </ul>
                    <p>상기 요청은 아래 문의처를 통해 접수할 수 있으며, 지체 없이 처리하겠습니다.</p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">10. 개인정보의 안전성 확보 조치</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>비밀번호는 암호화되어 저장 및 관리됩니다.</li>
                        <li>SSL/TLS 암호화 통신을 통해 데이터를 안전하게 전송합니다.</li>
                        <li>개인정보 접근 권한을 최소화하여 관리합니다.</li>
                    </ul>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">11. 개인정보처리방침의 변경</h3>
                    <p>
                        본 개인정보처리방침은 법령 변경 또는 서비스 변경 사항을 반영하기 위해 수정될 수 있습니다.
                        변경 시 본 페이지에 게시하며, 중요한 변경 사항은 서비스 내 공지를 통해 안내합니다.
                    </p>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-12 mb-4">12. 문의처</h3>
                    <p>개인정보 관련 문의는 아래 연락처로 문의해 주시기 바랍니다.</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>서비스명: 일상감 라이프 스튜디오</li>
                        <li>이메일: <a href="mailto:isglifestudio@gmail.com" className="text-blue-600 hover:underline">isglifestudio@gmail.com</a></li>
                        <li>문의 페이지: <Link href="/contact" className="text-blue-600 hover:underline">문의하기</Link></li>
                    </ul>

                    <div className="mt-12 pt-8 border-t border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">시행일자: 2026년 3월 15일</p>
                        <p className="text-xs text-slate-400 mt-1">최초 시행일자: 2026년 2월 28일</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
