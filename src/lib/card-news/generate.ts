import { createClient } from '@supabase/supabase-js';

const BUCKET = 'card-news';

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

// 카테고리별 디자인 힌트
const CATEGORY_STYLE: Record<string, string> = {
  Hacks: 'blue and navy color scheme, clean modern finance/lifestyle magazine style',
  Health: 'green and teal color scheme, fresh wellness magazine style',
  Tech: 'purple and indigo color scheme, futuristic tech magazine style',
  Entertainment: 'red and orange warm color scheme, vibrant entertainment magazine style',
};

// Gemini로 카드뉴스 이미지 직접 생성
async function generateSlideImage(prompt: string): Promise<Buffer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

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

    if (!res.ok) {
      console.error('Gemini image API error:', res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart) return null;

    return Buffer.from(imagePart.inlineData.data, 'base64');
  } catch (e) {
    console.error('Slide image generation failed:', e);
    return null;
  }
}

function buildSlidePrompts(input: CardNewsInput): { type: string; prompt: string }[] {
  const style = CATEGORY_STYLE[input.category] || CATEGORY_STYLE.Hacks;
  const brand = 'ILSANGGAM';
  const total = input.points.length + 3; // cover + intro + points + cta

  const baseStyle = `Instagram carousel card image, 1080x1350 pixels portrait orientation, ${style}, professional Korean infographic design, bold Korean typography, high contrast, eye-catching layout, modern graphic design with decorative elements and icons`;

  const slides: { type: string; prompt: string }[] = [];

  // 1. COVER
  slides.push({
    type: 'cover',
    prompt: `${baseStyle}.
COVER SLIDE (1/${total}).
Large bold title text in Korean: "${input.postTitle}"
Subtitle: "${input.excerpt}"
Small brand logo text "${brand}" at top left.
Dark dramatic background with accent color graphics and abstract shapes.
The title should be the dominant visual element, centered or left-aligned with large font.
Include decorative geometric elements, lines, or relevant icons.
NO English text except the brand name.`,
  });

  // 2. INTRO
  slides.push({
    type: 'intro',
    prompt: `${baseStyle}.
INTRO SLIDE (2/${total}).
Large decorative quotation mark at top.
Main text in Korean: "${input.intro}"
Below it, smaller text: "핵심만 쏙쏙 정리했습니다"
Brand "${brand}" small at top.
Gradient background with the accent color.
Elegant, minimal layout with plenty of white space.
NO English text except the brand name.`,
  });

  // 3~N. CONTENT slides
  input.points.forEach((point, i) => {
    const num = String(i + 1).padStart(2, '0');
    slides.push({
      type: 'content',
      prompt: `${baseStyle}.
CONTENT SLIDE (${i + 3}/${total}).
Large number "${num}" as a design element with accent color.
Bold title in Korean: "${point.title}"
Description text in Korean: "${point.detail}"
Brand "${brand}" small at top.
White or light background with accent color elements.
Include a relevant simple icon or illustration related to the topic.
Clean layout with clear visual hierarchy: number → title → description.
NO English text except the brand name and number.`,
    });
  });

  // LAST. CTA
  slides.push({
    type: 'cta',
    prompt: `${baseStyle}.
CTA (Call to Action) SLIDE (${total}/${total}).
Brand "${brand}" large at center top.
Main text in Korean: "더 자세한 내용이 궁금하다면?"
Below: "프로필 링크에서 전체 글 보기"
Instagram handle: "@ilsanggam"
Website: "isglifestudio.kr"
Dark background with accent color highlights.
Modern, clean, inviting design.
Include a subtle arrow or pointing element toward "프로필 링크".
NO other English text.`,
  });

  return slides;
}

export async function generateCardNews(
  slug: string,
  input: CardNewsInput,
): Promise<GenerateResult> {
  const slidePrompts = buildSlidePrompts(input);
  const sb = getSupabaseAdmin();

  const images: { index: number; url: string; type: string }[] = [];

  for (let i = 0; i < slidePrompts.length; i++) {
    const { type, prompt } = slidePrompts[i];

    const pngBuffer = await generateSlideImage(prompt);

    if (!pngBuffer) {
      console.error(`Failed to generate slide ${i + 1}`);
      continue;
    }

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
      type,
    });
  }

  return { slug, images };
}
