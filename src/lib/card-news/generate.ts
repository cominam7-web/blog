import satori from 'satori';
import sharp from 'sharp';
import { renderSlide, buildSlides, type CardNewsInput, type SlideData } from './templates';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const CARD_NEWS_BUCKET = 'card-news';
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

// Gemini로 배경 일러스트 이미지 생성
async function generateBgImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !prompt) return null;

  const styledPrompt = `minimalist flat design illustration, ${prompt}, simple shapes, clean lines, muted colors, no text, no letters, no words, white background, modern graphic design style`;
  const hash = crypto.createHash('sha256').update(styledPrompt).digest('hex').slice(0, 16);
  const filePath = `cardnews-${hash}.png`;

  const sb = getSupabaseAdmin();

  // 캐시 확인
  const { data: existing } = await sb.storage.from(IMAGE_BUCKET).download(filePath);
  if (existing) {
    const { data: urlData } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
    return urlData.publicUrl;
  }

  // Gemini 이미지 생성
  try {
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: styledPrompt }] }],
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
    });

    const { data: urlData } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch (e) {
    console.error('Background image generation failed:', e);
    return null;
  }
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

  // 배경 이미지 생성 (표지 + 각 포인트)
  const imagePrompts = [
    input.bgImageUrls?.[0] ? '' : (input as any).coverImagePrompt || '',
    ...input.points.map(p => p.imagePrompt || ''),
  ];

  const bgImageUrls: string[] = [];
  for (const prompt of imagePrompts) {
    if (prompt) {
      const url = await generateBgImage(prompt);
      bgImageUrls.push(url || '');
    } else {
      bgImageUrls.push('');
    }
  }

  const fullInput: CardNewsInput = {
    ...input,
    bgImageUrls: bgImageUrls.length > 0 ? bgImageUrls : undefined,
  };

  const slides = buildSlides(fullInput);
  const sb = getSupabaseAdmin();

  const images: { index: number; url: string; type: string }[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const pngBuffer = await renderSlideToPng(slide, input.category, fontData);

    const filePath = `${slug}/slide-${i + 1}.png`;

    const { error } = await sb.storage.from(CARD_NEWS_BUCKET).upload(filePath, pngBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

    if (error) {
      console.error(`Upload error for slide ${i + 1}:`, error.message);
    }

    const { data: urlData } = sb.storage.from(CARD_NEWS_BUCKET).getPublicUrl(filePath);
    images.push({
      index: i + 1,
      url: urlData.publicUrl,
      type: slide.type,
    });
  }

  return { slug, images };
}
