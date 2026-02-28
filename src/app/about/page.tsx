import Link from 'next/link';

export default function About() {
    return (
        <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-8 inline-block">
                    ← 홈으로 돌아가기
                </Link>

                <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">
                    About Ilsanggam Life Studio
                </h1>

                <div className="prose prose-slate prose-lg lg:prose-xl">
                    <p>
                        안녕하세요! <strong>Ilsanggam Life Studio</strong>에 오신 것을 환영합니다.
                        이곳은 단순한 정보 나열을 넘어, 여러분의 소중한 일상을 더 가치 있게 만드는 지식 스튜디오입니다.
                    </p>

                    <h3>우리의 철학</h3>
                    <p>
                        우리는 '일상의 감각'을 깨우는 정보를 제공합니다.
                        최첨단 AI 자동화 기술을 활용하여, 복잡한 세상 속에서 꼭 필요한 핵심 정보만을 정밀하게 추출하고
                        가장 읽기 편한 형태로 독자들에게 전달합니다.
                    </p>

                    <h3>전문적인 콘텐츠</h3>
                    <ul>
                        <li><strong>Life Hack</strong>: 일상의 효율을 극대화하는 스마트한 팁</li>
                        <li><strong>Smart Info</strong>: 놓치기 쉬운 정책, 금융, 생활 법률 정보</li>
                        <li><strong>AI Insights</strong>: 인공지능 기술이 제안하는 미래형 생활 방식</li>
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
