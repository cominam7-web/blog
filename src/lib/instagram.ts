// Instagram Graph API를 사용한 캐러셀(카드뉴스) 자동 게시

const API_BASE = 'https://graph.instagram.com/v22.0';

function getConfig() {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accountId || !accessToken) {
    throw new Error('INSTAGRAM_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN must be set');
  }
  return { accountId, accessToken };
}

// 단일 이미지 게시
export async function postSingleImage(imageUrl: string, caption: string): Promise<string> {
  const { accountId, accessToken } = getConfig();

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
  const { accountId, accessToken } = getConfig();

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
