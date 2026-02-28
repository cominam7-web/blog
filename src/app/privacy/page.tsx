import Link from 'next/link';

export default function Privacy() {
    return (
        <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-8 inline-block">
                    ← 홈으로 돌아가기
                </Link>

                <h1 className="text-3xl font-bold text-slate-900 mb-8">개인정보처리방침</h1>

                <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base">
                    <p>본 블로그(AI Auto Blog)는 정보주체의 개인정보를 소중하게 생각하며, 관련 법규를 준수합니다.</p>

                    <h4>1. 개인정보의 수집 항목 및 목적</h4>
                    <p>시스템 운영 및 서비스 개선을 위해 다음과 같은 비개인정보가 자동으로 수집될 수 있습니다.</p>
                    <ul>
                        <li>방문 일시, 접속 IP 주소, 브라우저 종류, 방문 경로 등 로그 데이터</li>
                    </ul>

                    <h4>2. 쿠키(Cookie)의 사용 및 거부</h4>
                    <p>사용자에게 맞춤형 서비스를 제공하기 위해 쿠키를 사용합니다. 사용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</p>

                    <h4>3. 제3자 광고 서비스 (중요)</h4>
                    <p>본 블로그는 구글 애드센스(Google AdSense) 등 제3자 광고 서비스를 이용할 수 있습니다. 해당 서비스는 사용자의 방문 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키를 활용할 수 있습니다.</p>

                    <h4>4. 개인정보의 보유 및 파기</h4>
                    <p>원칙적으로 수집 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>

                    <h4>5. 문의처</h4>
                    <p>개인정보 관련 문의는 블로그 운영자에게 연락해주시기 바랍니다.</p>

                    <p className="mt-8 text-xs text-slate-400">시행일자: 2026년 2월 28일</p>
                </div>
            </div>
        </main>
    );
}
