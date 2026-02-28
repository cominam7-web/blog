import Link from 'next/link';

export default function About() {
    return (
        <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-8 inline-block">
                    ← 홈으로 돌아가기
                </Link>

                <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">
                    About AI Auto Blog
                </h1>

                <div className="prose prose-slate prose-lg lg:prose-xl">
                    <p>
                        안녕하세요! <strong>AI Auto Blog</strong>에 오신 것을 환영합니다.
                        이 블로그는 최첨단 인공지능 기술과 클라우드 자동화 시스템을 결합하여 운영되는 미래형 지식 저장소입니다.
                    </p>

                    <h3>운영 목적</h3>
                    <p>
                        우리는 넘쳐나는 정보 속에서 가장 가치 있는 생활 정보와 지식을 골라내어,
                        누구나 이해하기 쉬운 언어로 정제하여 전달하는 것을 목표로 합니다.
                        복잡한 정책, 금융 정보, 일상 꿀팁들을 AI의 힘을 빌려 빠르고 정확하게 제공합니다.
                    </p>

                    <h3>사용된 기술</h3>
                    <ul>
                        <li><strong>Next.js 15</strong>: 쾌적한 속도와 SEO 최적화를 위한 현대적인 웹 프레임워크</li>
                        <li><strong>Google Gemini AI</strong>: 깊이 있고 인간미 넘치는 콘텐츠 생성을 위한 두뇌</li>
                        <li><strong>Make.com</strong>: 끊김 없는 콘텐츠 발행을 위한 자동화 파이프라인</li>
                        <li><strong>Supabase</strong>: 안전한 데이터 저장 및 관리를 위한 백엔드 서비스</li>
                    </ul>

                    <p>
                        단순히 정보를 나열하는 것을 넘어, 여러분의 삶에 실질적인 도움이 되는 블로그가 되겠습니다.
                        궁금한 점이나 제안하고 싶은 주제가 있다면 언제든 문의해 주세요.
                    </p>
                </div>
            </div>
        </main>
    );
}
