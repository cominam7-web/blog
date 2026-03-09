import { NextRequest, NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';

export async function POST(request: NextRequest) {
    // 간단한 인증 (admin API key 확인)
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY || '';
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!INDEXNOW_KEY) {
        return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const urls: string[] = body.urls || [];

        if (urls.length === 0) {
            return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
        }

        const payload = {
            host: new URL(siteUrl).hostname,
            key: INDEXNOW_KEY,
            keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
            urlList: urls.map(u => u.startsWith('http') ? u : `${siteUrl}${u}`),
        };

        const res = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
        });

        return NextResponse.json({
            success: true,
            status: res.status,
            submitted: payload.urlList.length,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
}
