import { NextRequest, NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/posts';
import { extractKeyPoints } from '@/lib/card-news/extract';
import { generateCardNews } from '@/lib/card-news/generate';
import { postCarousel, buildCaption } from '@/lib/instagram';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  );
}

export async function GET(request: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sb = getSupabaseAdmin();

    // 1. 이미 게시된 슬러그 목록 가져오기
    const { data: posted } = await sb
      .from('instagram_posts')
      .select('slug');

    const postedSlugs = new Set((posted || []).map((p: any) => p.slug));

    // 2. Hacks(생활정보) 카테고리 글 중 오래된 순으로 미게시 글 찾기
    const allPosts = getSortedPostsData()
      .filter(p => p.category === 'Hacks')
      .reverse(); // 오래된 순

    const nextPost = allPosts.find(p => !postedSlugs.has(p.slug));

    if (!nextPost) {
      return NextResponse.json({ message: 'All Hacks posts have been posted' });
    }

    // 3. 핵심 포인트 추출
    const { points, intro, coverImagePrompt } = await extractKeyPoints(
      nextPost.title, nextPost.content, 4
    );

    // 4. 카드뉴스 이미지 생성
    const result = await generateCardNews(nextPost.slug, {
      postTitle: nextPost.title,
      excerpt: nextPost.excerpt,
      category: nextPost.category,
      intro,
      points,
      coverImagePrompt,
    } as any);

    // 5. Instagram에 게시
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';
    const caption = buildCaption(
      nextPost.title, nextPost.excerpt, nextPost.category, siteUrl, nextPost.slug
    );
    const imageUrls = result.images.map(img => img.url);
    const instagramPostId = await postCarousel(imageUrls, caption);

    // 6. 게시 기록 저장
    await sb.from('instagram_posts').insert({
      slug: nextPost.slug,
      title: nextPost.title,
      instagram_post_id: instagramPostId,
      posted_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      slug: nextPost.slug,
      title: nextPost.title,
      instagramPostId,
    });
  } catch (error: any) {
    console.error('Cron card-news error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed' },
      { status: 500 }
    );
  }
}
