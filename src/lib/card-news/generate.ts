import satori from 'satori';
import sharp from 'sharp';
import { renderSlide, buildSlides, type CardNewsInput, type SlideData } from './templates';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'card-news';
const WIDTH = 1080;
const HEIGHT = 1350;

// 한글 폰트 캐시
let fontDataCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontDataCache) return fontDataCache;

  // Google Fonts에서 Noto Sans KR Bold 다운로드
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap';
  const cssRes = await fetch(fontUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
  });
  const css = await cssRes.text();

  // CSS에서 woff2 URL 추출 (700 weight 우선)
  const urlMatch = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/s\/notosanskr\/[^)]+\.woff2)\)/);
  if (!urlMatch) {
    throw new Error('Failed to find Noto Sans KR font URL');
  }

  const fontRes = await fetch(urlMatch[1]);
  fontDataCache = await fontRes.arrayBuffer();
  return fontDataCache;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

async function renderSlideToPng(slide: SlideData, category: string, fontData: ArrayBuffer): Promise<Buffer> {
  const element = renderSlide(slide, category);

  const svg = await satori(element as React.ReactNode, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'NotoSansKR',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  // sharp로 SVG → PNG 변환
  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT)
    .png()
    .toBuffer();

  return pngBuffer;
}

export interface GenerateResult {
  slug: string;
  images: { index: number; url: string; type: string }[];
}

export async function generateCardNews(
  slug: string,
  input: CardNewsInput,
): Promise<GenerateResult> {
  const fontData = await loadFont();
  const slides = buildSlides(input);
  const sb = getSupabaseAdmin();

  const images: { index: number; url: string; type: string }[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const pngBuffer = await renderSlideToPng(slide, input.category, fontData);

    const filePath = `${slug}/slide-${i + 1}.png`;

    // Supabase Storage에 업로드 (기존 파일 덮어쓰기)
    const { error } = await sb.storage.from(BUCKET).upload(filePath, pngBuffer, {
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
      type: slide.type,
    });
  }

  return { slug, images };
}
