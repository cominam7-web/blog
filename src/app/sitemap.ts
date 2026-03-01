import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.example.com'

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

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...postUrls,
    ]
}
