import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

const BUCKET = 'card-news';
const WIDTH = 1080;
const HEIGHT = 1350;

// @sparticuz/chromium 공식 릴리즈 바이너리 (v143.0.4, x64)
const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

export interface CardNewsInput {
  postTitle: string;
  excerpt: string;
  category: string;
  intro: string;
  points: { title: string; detail: string; imagePrompt?: string }[];
  coverImagePrompt?: string;
  bgImageUrls?: string[];
}

export interface GenerateResult {
  slug: string;
  images: { index: number; url: string; type: string }[];
}

// Gemini에게 전체 카드뉴스 HTML 생성 요청
async function generateCardHtml(input: CardNewsInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const pointsText = input.points.map((p, i) =>
    `슬라이드${i + 3}: 번호 "${String(i + 1).padStart(2, '0')}", 제목 "${p.title}", 설명 "${p.detail}"`
  ).join('\n');

  const prompt = `당신은 인스타그램 카드뉴스 HTML 디자이너입니다.
아래 블로그 글 정보로 카드뉴스 HTML을 만들어주세요.

## 블로그 정보
- 제목: ${input.postTitle}
- 소개: ${input.excerpt}
- 인트로: ${input.intro}
- 카테고리: ${input.category}
- 브랜드: ILSANGGAM

## 슬라이드 구성
슬라이드1 (COVER): 제목 "${input.postTitle}", 부제 "${input.excerpt}"
슬라이드2 (INTRO): "${input.intro}", 하단에 "핵심만 쏙쏙 정리했습니다"
${pointsText}
슬라이드${input.points.length + 3} (CTA): "더 자세한 내용이 궁금하다면?", "프로필 링크에서 전체 글 보기", "@ilsanggam", "isglifestudio.kr"

## 디자인 규칙 (필수)
1. 각 슬라이드는 정확히 1080px × 1350px
2. 글 주제에 어울리는 컬러 스킴 선택 (매번 다른 느낌)
3. 모든 카드를 세로로 나열, 카드 사이 간격 없음
4. 한국어 폰트: font-family: 'Noto Sans KR', sans-serif
5. Google Fonts import 포함
6. COVER: 다크 배경, 큰 타이포그래피, 장식 도형/그라데이션
7. INTRO: 큰 따옴표 장식, 중앙 정렬, 인상적인 배경
8. CONTENT: 큰 번호, 굵은 제목, 설명, 데이터 시각화 요소 (막대그래프/비교박스/아이콘 등 활용)
9. CTA: 다크 배경, 브랜드 강조, 인스타 핸들
10. 인포그래픽 스타일: 단순 텍스트 나열이 아닌, 박스/뱃지/그래프/아이콘 등 시각 요소 적극 활용
11. 각 슬라이드 우하단에 페이지 번호 (1/N 형식)
12. CSS만 사용 (JavaScript 없음)
13. 이모지를 아이콘 대용으로 활용 가능
14. 외부 이미지 URL 사용 금지, CSS만으로 장식

## 텍스트 줄바꿈 규칙 (매우 중요!)
- body에 word-break: keep-all 적용하여 한국어 단어 단위 줄바꿈
- 모든 제목, 숫자+단위, 핵심 키워드에 white-space: nowrap 적용
- 한국어에서 숫자와 단위는 반드시 한 줄에 표시 (예: "10만 원", "3만 원", "100%", "12월 31일")
- 숫자+단위 조합은 <span style="white-space:nowrap">으로 감싸기
- 제목이 너무 길면 폰트 크기를 줄여서라도 어색한 줄바꿈 방지
- 박스/카드 안의 텍스트는 충분한 너비 확보하여 줄바꿈 최소화

## 출력 형식
완전한 HTML 문서 하나를 반환하세요. \`\`\`html 코드블록 안에 넣어주세요.
<!DOCTYPE html>부터 </html>까지 전체를 포함하세요.`;

  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 30000 },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API failed: ${res.status}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // HTML 코드블록 추출
  const htmlMatch = text.match(/```html\s*([\s\S]*?)```/);
  if (htmlMatch) return htmlMatch[1].trim();

  // 코드블록 없이 HTML 직접 반환된 경우
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    const start = text.indexOf('<!DOCTYPE') !== -1 ? text.indexOf('<!DOCTYPE') : text.indexOf('<html');
    return text.slice(start).trim();
  }

  throw new Error('Failed to extract HTML from Gemini response');
}

// Puppeteer로 HTML을 슬라이드별 PNG로 캡처
async function htmlToSlideImages(html: string, slideCount: number): Promise<Buffer[]> {
  const executablePath = await chromium.executablePath(CHROMIUM_URL);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: WIDTH, height: HEIGHT },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    // 폰트 로딩 대기
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 500));

    const images: Buffer[] = [];

    for (let i = 0; i < slideCount; i++) {
      const screenshot = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: i * HEIGHT, width: WIDTH, height: HEIGHT },
      });

      images.push(Buffer.from(screenshot));
    }

    return images;
  } finally {
    await browser.close();
  }
}

export async function generateCardNews(
  slug: string,
  input: CardNewsInput,
): Promise<GenerateResult> {
  const slideCount = input.points.length + 3; // cover + intro + points + cta

  // 1. Gemini로 HTML 생성
  const html = await generateCardHtml(input);

  // 2. Puppeteer로 슬라이드별 스크린샷
  const slideImages = await htmlToSlideImages(html, slideCount);

  // 3. Supabase에 업로드
  const sb = getSupabaseAdmin();
  const images: { index: number; url: string; type: string }[] = [];
  const types = ['cover', 'intro', ...input.points.map(() => 'content'), 'cta'];

  for (let i = 0; i < slideImages.length; i++) {
    const filePath = `${slug}/slide-${i + 1}.png`;

    const { error } = await sb.storage.from(BUCKET).upload(filePath, slideImages[i], {
      contentType: 'image/png',
      upsert: true,
    });

    if (error) {
      console.error(`Upload error for slide ${i + 1}:`, error.message);
    }

    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filePath);
    images.push({
      index: i + 1,
      url: urlData.publicUrl,
      type: types[i] || 'content',
    });
  }

  // 4. HTML도 저장 (나중에 수정 가능)
  await sb.storage.from(BUCKET).upload(`${slug}/source.html`, html, {
    contentType: 'text/html',
    upsert: true,
  });

  return { slug, images };
}
