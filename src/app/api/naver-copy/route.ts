import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { getPostData } from '@/lib/posts';
import { resolveNanobanana } from '@/lib/nanobanana';

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  const post = getPostData(slug);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://isglifestudio.kr';

  // 마크다운을 네이버 블로그 HTML로 변환
  const tagList = (post.tags || []).map((t: string) => `#${t}`);
  const html = convertToNaverHtml(post.title, post.content, post.category, siteUrl, slug, tagList);

  // 순수 텍스트 버전 (네이버 스마트에디터용)
  const plainText = convertToPlainText(post.title, post.content, post.category, siteUrl, slug, tagList);

  return NextResponse.json({
    title: post.title,
    category: post.category,
    tags: (post.tags || []).map((t: string) => `#${t}`),
    html,
    plainText,
    sourceUrl: `${siteUrl}/blog/${slug}`,
  });
}

function convertToNaverHtml(
  title: string,
  content: string,
  category: string,
  siteUrl: string,
  slug: string,
  tags: string[] = [],
): string {
  let html = content;

  // 나노바나나 이미지 태그를 HTML img로 변환
  html = html.replace(
    /[\[［]\s*(?:나노|nano)[\s\S]*?[:：\-\s]\s*([\s\S]*?)[\]］]/gi,
    (_, prompt) => {
      const imgUrl = resolveNanobanana(`[나노바나나: ${prompt}]`);
      if (imgUrl && imgUrl !== `[나노바나나: ${prompt}]`) {
        return `<div style="text-align:center;margin:20px 0"><img src="${imgUrl}" alt="${prompt.trim()}" style="max-width:100%;border-radius:8px" /></div>`;
      }
      return '';
    }
  );

  // 마크다운 → HTML 변환
  // 헤더
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:bold;margin:24px 0 12px;color:#333">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:22px;font-weight:bold;margin:28px 0 14px;color:#222">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:26px;font-weight:bold;margin:32px 0 16px;color:#111">$1</h1>');

  // 볼드, 이탤릭
  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.+?)\*/g, '<i>$1</i>');

  // 리스트
  html = html.replace(/^- (.+)$/gm, '<li style="margin:4px 0;line-height:1.8">$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li style="margin:4px 0;line-height:1.8">$2</li>');

  // 연속된 li를 ul로 감싸기
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, '<ul style="margin:12px 0;padding-left:20px">$1</ul>');

  // 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0068c3;text-decoration:underline">$1</a>');

  // 수평선
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:24px 0" />');

  // 빈 줄 → 단락
  html = html.replace(/\n\n/g, '</p><p style="margin:16px 0;line-height:1.9;font-size:16px;color:#333">');

  // 전체 감싸기
  const categoryLabel = category === 'Hacks' ? '생활정보' :
    category === 'Health' ? '건강' :
    category === 'Tech' ? '테크' :
    category === 'Entertainment' ? '엔터테인먼트' : category;

  return `<div style="max-width:720px;margin:0 auto;font-family:'Noto Sans KR',sans-serif">
<p style="display:inline-block;background:#f0f4ff;color:#2563eb;font-size:13px;font-weight:bold;padding:4px 12px;border-radius:4px;margin-bottom:8px">${categoryLabel}</p>
<p style="margin:16px 0;line-height:1.9;font-size:16px;color:#333">${html}</p>
<hr style="border:none;border-top:1px solid #ddd;margin:32px 0" />
<p style="text-align:center;font-size:14px;color:#888;line-height:1.6">
이 글이 도움이 되셨다면 <b>이웃추가</b>와 <b>공감</b> 부탁드려요! 💙<br/>
원문 보기: <a href="${siteUrl}/blog/${slug}" style="color:#0068c3">${siteUrl}/blog/${slug}</a>
</p>
<p style="text-align:center;font-size:14px;color:#0068c3;margin-top:16px;line-height:2">
${tags.join(' ')}
</p>
</div>`;
}

function convertToPlainText(
  title: string,
  content: string,
  category: string,
  siteUrl: string,
  slug: string,
  tags: string[] = [],
): string {
  let text = content;

  // 나노바나나 태그 제거
  text = text.replace(/[\[［]\s*(?:나노|nano)[\s\S]*?[:：\-\s]\s*[\s\S]*?[\]］]/gi, '');

  // 마크다운 기호 제거
  text = text.replace(/^#{1,3}\s/gm, '');
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/^---$/gm, '─────────────────');
  text = text.replace(/^- /gm, '• ');

  const categoryLabel = category === 'Hacks' ? '생활정보' :
    category === 'Health' ? '건강' :
    category === 'Tech' ? '테크' :
    category === 'Entertainment' ? '엔터테인먼트' : category;

  return `[${categoryLabel}] ${title}\n\n${text}\n\n─────────────────\n이 글이 도움이 되셨다면 이웃추가와 공감 부탁드려요!\n원문: ${siteUrl}/blog/${slug}\n\n${tags.join(' ')}`;
}
