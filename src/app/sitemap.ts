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

    const categoryUrls = CATEGORY_SLUGS.map((cat) => ({
        url: `${baseUrl}/category/${cat}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

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

    const staticPages = [
        { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/contact`, changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/privacy`, changeFrequency: 'monthly' as const, priority: 0.3 },
    ].map((p) => ({ ...p, lastModified: new Date().toISOString() }));

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
        ...staticPages,
    ]
}
