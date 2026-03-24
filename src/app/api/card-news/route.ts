import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { getPostData, getSortedPostsData } from '@/lib/posts';
import { extractKeyPoints } from '@/lib/card-news/extract';
import { generateCardNews } from '@/lib/card-news/generate';
import { postCarousel, buildCaption } from '@/lib/instagram';

export const maxDuration = 120;

// GET: 포스트 목록 반환 (카드뉴스 생성용)
export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = getSortedPostsData().map(({ slug, title, category, date }) => ({
    slug, title, category, date,
  }));

  return NextResponse.json({ posts });
}

// POST: 카드뉴스 생성
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { slug, pointCount = 4, publishToInstagram = false } = body;

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const post = getPostData(slug);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    // 1. Gemini로 핵심 포인트 + 이미지 프롬프트 추출
    const { points, intro, coverImagePrompt } = await extractKeyPoints(post.title, post.content, pointCount);

    // 2. 카드뉴스 이미지 생성 (배경 일러스트 포함)
    const result = await generateCardNews(slug, {
      postTitle: post.title,
      excerpt: post.excerpt,
      category: post.category,
      intro,
      points,
      coverImagePrompt,
    } as any);

    // 3. Instagram에 자동 게시 (옵션)
    let instagramPostId: string | undefined;
    if (publishToInstagram && result.images.length >= 2) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';
        const caption = buildCaption(post.title, post.excerpt, post.category, siteUrl, slug);
        const imageUrls = result.images.map(img => img.url);
        instagramPostId = await postCarousel(imageUrls, caption);
      } catch (igError: any) {
        console.error('Instagram publish error:', igError);
        // Instagram 게시 실패해도 카드뉴스 생성 결과는 반환
        return NextResponse.json({ ...result, instagramError: igError.message });
      }
    }

    return NextResponse.json({ ...result, instagramPostId });
  } catch (error: any) {
    console.error('Card news generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate card news' },
      { status: 500 }
    );
  }
}
