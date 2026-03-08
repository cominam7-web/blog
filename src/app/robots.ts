import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/admin/', '/api/', '/search'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
