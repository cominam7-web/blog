// Instagram Graph API를 사용한 캐러셀(카드뉴스) 자동 게시

import { createClient } from '@supabase/supabase-js';

const API_BASE = 'https://graph.instagram.com/v22.0';
const TOKEN_TABLE = 'instagram_token';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  );
}

// Supabase에서 최신 토큰 가져오기 (없으면 env 사용)
async function getAccessToken(): Promise<string> {
  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from(TOKEN_TABLE)
      .select('access_token, expires_at')
      .eq('id', 'instagram')
      .single();

    if (data?.access_token) {
      return data.access_token;
    }
  } catch {
    // 테이블이 없거나 에러 시 env fallback
  }
  return process.env.INSTAGRAM_ACCESS_TOKEN || '';
}

// 토큰 갱신 (만료 7일 전 자동 갱신)
export async function refreshTokenIfNeeded(): Promise<{ refreshed: boolean; expiresAt?: string; error?: string }> {
  const sb = getSupabaseAdmin();
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  if (!appSecret) {
    return { refreshed: false, error: 'INSTAGRAM_APP_SECRET not set' };
  }

  // DB에서 현재 토큰 정보 가져오기
  let currentToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
  let expiresAt: string | null = null;

  try {
    const { data } = await sb
      .from(TOKEN_TABLE)
      .select('access_token, expires_at')
      .eq('id', 'instagram')
      .single();

    if (data) {
      currentToken = data.access_token;
      expiresAt = data.expires_at;
    }
  } catch {
    // 첫 실행 시 테이블/레코드 없을 수 있음
  }

  if (!currentToken) {
    return { refreshed: false, error: 'No access token found' };
  }

  // 만료일 확인 (7일 이내면 갱신)
  if (expiresAt) {
    const expDate = new Date(expiresAt);
    const now = new Date();
    const daysLeft = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysLeft > 7) {
      return { refreshed: false, expiresAt };
    }
  }

  // 토큰 갱신 요청
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
  );
  const data = await res.json();

  if (data.error) {
    return { refreshed: false, error: data.error.message };
  }

  const newToken = data.access_token;
  const expiresIn = data.expires_in || 5184000; // 기본 60일
  const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  // DB에 저장 (upsert)
  await sb.from(TOKEN_TABLE).upsert({
    id: 'instagram',
    access_token: newToken,
    expires_at: newExpiresAt,
    updated_at: new Date().toISOString(),
  });

  return { refreshed: true, expiresAt: newExpiresAt };
}

// 토큰을 DB에 초기 저장
export async function saveTokenToDb(): Promise<void> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return;

  const sb = getSupabaseAdmin();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60일 후

  await sb.from(TOKEN_TABLE).upsert({
    id: 'instagram',
    access_token: token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
}

function getConfig() {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  if (!accountId) {
    throw new Error('INSTAGRAM_ACCOUNT_ID must be set');
  }
  return { accountId };
}

// 단일 이미지 게시
export async function postSingleImage(imageUrl: string, caption: string): Promise<string> {
  const { accountId } = getConfig();
  const accessToken = await getAccessToken();

  // 1. 미디어 컨테이너 생성
  const createRes = await fetch(`${API_BASE}/${accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    }),
  });

  const createData = await createRes.json();
  if (createData.error) {
    throw new Error(`Instagram create error: ${createData.error.message}`);
  }

  const containerId = createData.id;

  // 2. 게시
  const publishRes = await fetch(`${API_BASE}/${accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Instagram publish error: ${publishData.error.message}`);
  }

  return publishData.id;
}

// 캐러셀(카드뉴스) 게시
export async function postCarousel(imageUrls: string[], caption: string): Promise<string> {
  const { accountId } = getConfig();
  const accessToken = await getAccessToken();

  // 게시 전 토큰 자동 갱신 시도
  await refreshTokenIfNeeded().catch(() => {});

  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error('Carousel requires 2-10 images');
  }

  // 1. 각 이미지에 대한 미디어 컨테이너 생성
  const childIds: string[] = [];

  for (const imageUrl of imageUrls) {
    const res = await fetch(`${API_BASE}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        is_carousel_item: true,
        access_token: accessToken,
      }),
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(`Instagram carousel item error: ${data.error.message}`);
    }

    childIds.push(data.id);
  }

  // 2. 캐러셀 컨테이너 생성
  const carouselRes = await fetch(`${API_BASE}/${accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds,
      caption,
      access_token: accessToken,
    }),
  });

  const carouselData = await carouselRes.json();
  if (carouselData.error) {
    throw new Error(`Instagram carousel error: ${carouselData.error.message}`);
  }

  // 3. 게시
  const publishRes = await fetch(`${API_BASE}/${accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: carouselData.id,
      access_token: accessToken,
    }),
  });

  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Instagram publish error: ${publishData.error.message}`);
  }

  return publishData.id;
}

// 블로그 포스트 기반 캡션 생성
export function buildCaption(
  title: string,
  excerpt: string,
  category: string,
  siteUrl: string,
  slug: string,
): string {
  const categoryTags: Record<string, string> = {
    Hacks: '#생활정보 #꿀팁 #생활꿀팁 #절약 #정보공유',
    Health: '#건강 #건강관리 #건강정보 #웰빙 #건강팁',
    Tech: '#테크 #IT #기술 #디지털 #스마트라이프',
    Entertainment: '#엔터테인먼트 #영화 #드라마 #추천 #콘텐츠',
  };

  const tags = categoryTags[category] || '#일상 #정보';

  return `📌 ${title}

${excerpt}

👉 자세한 내용은 프로필 링크에서!
🔗 ${siteUrl}/blog/${slug}

${tags} #일상감 #블로그 #카드뉴스`;
}
