// 필라 페이지 데이터 정의
export interface PillarSection {
    title: string;
    description: string;
    tags: string[]; // 이 섹션에 매칭할 태그/키워드
}

export interface PillarPageData {
    slug: string;
    category: string;
    title: string;
    description: string;
    metaDescription: string;
    intro: string;
    sections: PillarSection[];
}

export const PILLAR_PAGES: PillarPageData[] = [
    {
        slug: 'money-saving-hacks',
        category: 'Hacks',
        title: '2026년 돈 아끼는 생활 꿀팁 총정리',
        description: '정부 지원금, 세금 환급, 절약 팁까지 모르면 손해 보는 생활 정보 완벽 가이드',
        metaDescription: '정부 지원금부터 세금 환급, 통신비 절약, 숨은 돈 찾기까지. 2026년 알면 돈 되는 생활 꿀팁을 총정리했습니다.',
        intro: '매달 나가는 돈은 정해져 있는데, 받을 수 있는 혜택은 모르고 지나치는 경우가 많습니다. 정부 지원금, 세금 환급, 통신비 절약부터 숨은 돈 찾기까지 — 이 가이드 하나로 놓치고 있던 혜택을 전부 챙기세요.',
        sections: [
            {
                title: '정부 지원금 & 바우처',
                description: '국가와 지자체에서 제공하는 각종 지원금과 바우처를 총정리했습니다.',
                tags: ['지원금', '바우처', '급여', '지원', '카드', '취업', '교육', '청년', '부모'],
            },
            {
                title: '세금 환급 & 절약',
                description: '내가 낸 세금, 돌려받을 수 있는 방법을 알려드립니다.',
                tags: ['세금', '환급', '환급금', '보험료', '본인부담', '경정청구', '자동차세'],
            },
            {
                title: '통신비 & 생활비 절약',
                description: '매달 고정 지출을 줄이는 스마트한 방법들입니다.',
                tags: ['통신', '알뜰', '요금', '할인', '캐시백', '상품권', '교통'],
            },
            {
                title: '숨은 돈 찾기',
                description: '나도 모르게 잠자고 있는 돈을 찾아보세요.',
                tags: ['숨은', '미환급', '금융자산', '잠자는'],
            },
            {
                title: '주거 & 부동산 혜택',
                description: '월세 지원부터 내 집 마련까지, 주거 관련 혜택입니다.',
                tags: ['월세', '주택', '전세', '부동산', '임대'],
            },
        ],
    },
    {
        slug: 'smart-tech-guide',
        category: 'Tech',
        title: '스마트한 디지털 생활 완벽 가이드',
        description: '생산성 도구, 보안, 무료 앱까지 디지털 생활을 업그레이드하는 테크 꿀팁 총정리',
        metaDescription: '생산성 앱, 디지털 보안, 무료 도구 활용법까지. 디지털 생활을 200% 업그레이드하는 테크 꿀팁을 총정리했습니다.',
        intro: '좋은 도구를 알면 시간이 절약되고, 보안 습관을 들이면 소중한 정보를 지킬 수 있습니다. AI 도구부터 생산성 앱, 디지털 보안까지 — 스마트한 디지털 생활을 위한 모든 것을 담았습니다.',
        sections: [
            {
                title: 'AI & 스마트 도구',
                description: 'AI를 활용해 업무와 일상을 더 효율적으로 만드는 방법입니다.',
                tags: ['AI', '자동화', '번역', '검색', '노션', 'Perplexity', 'DeepL'],
            },
            {
                title: '생산성 & 업무 도구',
                description: '시간을 아끼고 생산성을 높이는 필수 도구들입니다.',
                tags: ['생산성', '브라우저', '클립보드', '단축어', '원격', '편집', '정리'],
            },
            {
                title: '디지털 보안',
                description: '해킹과 개인정보 유출로부터 나를 지키는 방법입니다.',
                tags: ['보안', '해킹', '비밀번호', 'OTP', 'VPN', '와이파이'],
            },
            {
                title: '무료 도구 & 서비스',
                description: '돈 들이지 않고 전문가처럼 활용하는 무료 도구들입니다.',
                tags: ['무료', 'PDF', '디자인', '파일', '클라우드', '드라이브'],
            },
        ],
    },
    {
        slug: 'health-wellness-guide',
        category: 'Health',
        title: '내 몸을 지키는 건강 관리 완벽 가이드',
        description: '건강검진, 의료비 절약, 생활 건강 상식까지 실전 건강 관리 총정리',
        metaDescription: '건강검진 활용법, 의료비 지원제도, 생활 건강 상식까지. 내 몸과 지갑을 동시에 지키는 건강 관리 가이드입니다.',
        intro: '건강은 잃고 나서야 소중함을 깨닫습니다. 하지만 미리 알면 예방할 수 있고, 의료비도 크게 줄일 수 있습니다. 국가 건강검진 활용법부터 의료비 지원제도, 일상 건강 관리까지 총정리했습니다.',
        sections: [
            {
                title: '의료비 지원 & 절약',
                description: '병원비 부담을 줄이는 국가 지원제도를 총정리했습니다.',
                tags: ['의료비', '병원비', '본인부담', '재난적', '응급', '지원', '보험'],
            },
            {
                title: '건강검진 & 예방',
                description: '정기 검진과 예방접종으로 건강을 지키는 방법입니다.',
                tags: ['건강검진', '예방접종', '스케일링', '금연'],
            },
            {
                title: '생활 건강 상식',
                description: '일상에서 바로 실천할 수 있는 건강 관리법입니다.',
                tags: ['수면', '빈혈', '혈당', '식중독', '미세먼지', '약', '대장'],
            },
            {
                title: '응급 & 안전',
                description: '위급 상황에서 나와 가족을 지키는 필수 지식입니다.',
                tags: ['응급', '하임리히', '안전'],
            },
        ],
    },
    {
        slug: 'entertainment-picks',
        category: 'Entertainment',
        title: '정주행 필수! 엔터테인먼트 추천 가이드',
        description: '드라마, 영화, K-POP, 게임까지 지금 봐야 할 콘텐츠 총정리',
        metaDescription: '넷플릭스 드라마, 극장 영화, K-POP, 게임까지. 지금 정주행해야 할 엔터테인먼트 콘텐츠를 총정리했습니다.',
        intro: '볼 건 많은데 뭘 봐야 할지 모르겠다면, 이 가이드를 참고하세요. 검증된 명작부터 지금 핫한 신작까지, 시간 낭비 없이 즐길 수 있는 콘텐츠만 엄선했습니다.',
        sections: [
            {
                title: '넷플릭스 & OTT 추천',
                description: '스트리밍 플랫폼에서 꼭 봐야 할 작품들입니다.',
                tags: ['넷플릭스', '디즈니', 'OTT', '정주행', '시리즈'],
            },
            {
                title: '극장 영화 & 화제작',
                description: '극장에서 봐야 제맛인 화제의 영화들입니다.',
                tags: ['영화', '극장', '관객', '관람'],
            },
            {
                title: 'K-POP & 음악',
                description: '전 세계를 사로잡은 K-POP 소식과 추천입니다.',
                tags: ['K-POP', 'BTS', '뉴진스', '컴백', '콘서트'],
            },
            {
                title: '드라마 & 예능',
                description: 'N차 관람을 부르는 인생 드라마와 예능입니다.',
                tags: ['드라마', '예능', '시청률', '인생'],
            },
        ],
    },
];

export function getPillarPage(slug: string): PillarPageData | undefined {
    return PILLAR_PAGES.find(p => p.slug === slug);
}

export function getAllPillarSlugs(): string[] {
    return PILLAR_PAGES.map(p => p.slug);
}
