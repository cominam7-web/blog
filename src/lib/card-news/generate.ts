import satori from 'satori';
import sharp from 'sharp';
import { renderSlide, buildSlides, type CardNewsInput, type SlideData } from './templates';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const BUCKET = 'card-news';
const IMAGE_BUCKET = 'generated-images';
const WIDTH = 1080;
const HEIGHT = 1350;

let fontDataCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontDataCache) return fontDataCache;

  const fontUrl = 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf';
  const fontRes = await fetch(fontUrl);

  if (!fontRes.ok) {
    throw new Error(`Failed to download font: ${fontRes.status}`);
  }

  fontDataCache = await fontRes.arrayBuffer();
  return fontDataCache;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

// 카테고리별 배경 스타일
const CATEGORY_BG_STYLE: Record<string, string> = {
  Hacks: 'dark navy blue background with golden geometric lines, abstract diamond shapes, subtle star particles, luxury finance magazine aesthetic',
  Health: 'dark emerald green background with soft leaf patterns, organic flowing curves, subtle nature elements, wellness magazine aesthetic',
  Tech: 'dark indigo purple background with neon circuit patterns, digital grid lines, glowing nodes, futuristic tech magazine aesthetic',
  Entertainment: 'dark warm charcoal background with vibrant red and orange geometric bursts, spotlight effects, entertainment magazine aesthetic',
};

// Gemini로 배경 그래픽만 생성 (텍스트 없이)
async function generateBgGraphic(category: string, context: string): Promise<Buffer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const bgStyle = CATEGORY_BG_STYLE[category] || CATEGORY_BG_STYLE.Hacks;
  const prompt = `Create a decorative background graphic for an Instagram card (1080x1350 portrait).
${bgStyle}.
Context: ${context}.
Include relevant simple icons or illustrations as decorative elements.
ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO WRITING of any kind.
Pure visual decoration only - geometric shapes, icons, patterns, gradients.
The design should leave space in the center for text to be overlaid later.`;

  const hash = crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16);
  const filePath = `bg-${hash}.png`;

  const sb = getSupabaseAdmin();

  // 캐시 확인
  const { data: existing } = await sb.storage.from(IMAGE_BUCKET).download(filePath);
  if (existing) {
    const buf = Buffer.from(await existing.arrayBuffer());
    return buf;
  }

  try {
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart) return null;

    const buf = Buffer.from(imagePart.inlineData.data, 'base64');

    await sb.storage.from(IMAGE_BUCKET).upload(filePath, buf, {
      contentType: 'image/png',
      upsert: false,
    }).catch(() => {});

    return buf;
  } catch (e) {
    console.error('Background generation failed:', e);
    return null;
  }
}

// 배경 + 텍스트 오버레이 합성
async function renderSlideWithBg(
  slide: SlideData,
  category: string,
  fontData: ArrayBuffer,
  bgBuffer: Buffer | null,
): Promise<Buffer> {
  // 1. Satori로 텍스트 레이어 생성 (투명 배경)
  const element = renderSlide(slide, category);
  const svg = await satori(element as React.ReactNode, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'NotoSansKR', data: fontData, weight: 700, style: 'normal' as const },
    ],
  });

  const textLayer = await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT)
    .png()
    .toBuffer();

  if (!bgBuffer) {
    return textLayer;
  }

  // 2. 배경 이미지를 1080x1350으로 리사이즈
  const bgResized = await sharp(bgBuffer)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .png()
    .toBuffer();

  // 3. 배경 위에 텍스트 레이어 합성
  const composited = await sharp(bgResized)
    .composite([{ input: textLayer, top: 0, left: 0 }])
    .png()
    .toBuffer();

  return composited;
}

export type { CardNewsInput } from './templates';

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

  // 배경 이미지를 병렬로 생성 (cover, content 슬라이드에만)
  const bgBuffers: (Buffer | null)[] = [];
  for (const slide of slides) {
    if (slide.type === 'cover') {
      const bg = await generateBgGraphic(input.category, `cover for: ${input.postTitle}`);
      bgBuffers.push(bg);
    } else if (slide.type === 'content') {
      const bg = await generateBgGraphic(input.category, `content about: ${slide.point}`);
      bgBuffers.push(bg);
    } else {
      // intro, cta는 배경 없이 그라데이션만 사용
      bgBuffers.push(null);
    }
  }

  const images: { index: number; url: string; type: string }[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const pngBuffer = await renderSlideWithBg(slide, input.category, fontData, bgBuffers[i]);

    const filePath = `${slug}/slide-${i + 1}.png`;

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
