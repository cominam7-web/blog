import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'
import { CATEGORY_SLUGS } from '@/lib/categories'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr'

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getSortedPostsData()

    const postUrls = posts.map((post) => {
        const d = new Date(post.date);
        const lastModified = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        return {
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        };
    })

    // 카테고리 페이지: 최신 포스트 날짜를 lastModified로 사용
    const categoryUrls = CATEGORY_SLUGS.map((cat) => {
        const latestInCategory = cat === 'latest'
            ? posts[0]
            : posts.find(p => p.category?.toLowerCase().replace(/ /g, '-') === cat);
        const lastMod = latestInCategory
            ? new Date(latestInCategory.date).toISOString()
            : new Date().toISOString();
        return {
            url: `${baseUrl}/category/${cat}`,
            lastModified: lastMod,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        };
    });

    const guideSlugs = [
        'money-saving-hacks',
        'smart-tech-guide',
        'health-wellness-guide',
        'entertainment-picks',
    ]

    const guideUrls = guideSlugs.map((slug) => ({
        url: `${baseUrl}/guide/${slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    // 태그 페이지: 글 3개 이상인 태그만 sitemap에 포함 (thin content 방지)
    const tagCount = new Map<string, number>();
    for (const post of posts) {
        for (const tag of post.tags) {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        }
    }
    const tagUrls = Array.from(tagCount.entries())
        .filter(([, count]) => count >= 3)
        .map(([tag]) => ({
            url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        }));

    const staticPages = [
        { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/contact`, changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/privacy`, changeFrequency: 'monthly' as const, priority: 0.3 },
        { url: `${baseUrl}/terms`, changeFrequency: 'monthly' as const, priority: 0.3 },
    ].map((p) => ({ ...p, lastModified: '2026-03-19T00:00:00.000Z' }));

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...guideUrls,
        ...categoryUrls,
        ...postUrls,
        ...tagUrls,
        ...staticPages,
    ]
}
