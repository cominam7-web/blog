// 카테고리 목록 - 단일 소스 (모든 컴포넌트에서 이 파일을 import)
export const CATEGORIES = ['Hacks', 'Tech', 'Entertainment', 'Health'] as const;

export type Category = (typeof CATEGORIES)[number];

// URL용 슬러그 변환 (예: "Best Picks" → "best-picks")
export function categoryToSlug(category: string): string {
    return category.toLowerCase().replace(/ /g, '-');
}

// 슬러그에서 카테고리명 복원 (예: "best-picks" → "Best Picks")
export function slugToCategory(slug: string): string | undefined {
    return CATEGORIES.find(c => categoryToSlug(c) === slug.toLowerCase());
}

// generateStaticParams용 전체 슬러그 목록 (latest 포함)
export const CATEGORY_SLUGS = ['latest', ...CATEGORIES.map(categoryToSlug)] as const;
