import type { ReactNode } from 'react';

// 카테고리별 컬러 테마
const CATEGORY_THEMES: Record<string, { bg: string; accent: string; text: string; sub: string }> = {
  Hacks: { bg: '#EFF6FF', accent: '#2563EB', text: '#1E3A5F', sub: '#3B82F6' },
  Health: { bg: '#F0FDF4', accent: '#16A34A', text: '#14532D', sub: '#22C55E' },
  Tech: { bg: '#F5F3FF', accent: '#7C3AED', text: '#3B0764', sub: '#8B5CF6' },
  Entertainment: { bg: '#FFF1F2', accent: '#E11D48', text: '#4C0519', sub: '#F43F5E' },
};

function getTheme(category: string) {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES.Hacks;
}

// 사이트 로고/브랜드명
const BRAND = 'ILSANGGAM';
const SITE_URL = 'isglifestudio.kr';

export interface SlideData {
  type: 'cover' | 'content' | 'cta';
  title?: string;
  subtitle?: string;
  point?: string;
  detail?: string;
  index?: number;
  total?: number;
}

export interface CardNewsInput {
  postTitle: string;
  excerpt: string;
  category: string;
  points: { title: string; detail: string }[];
}

export function buildSlides(input: CardNewsInput): SlideData[] {
  const slides: SlideData[] = [];
  const total = input.points.length + 2; // cover + points + cta

  // 1. 표지
  slides.push({
    type: 'cover',
    title: input.postTitle,
    subtitle: input.excerpt,
    index: 1,
    total,
  });

  // 2~N. 본문 포인트
  input.points.forEach((p, i) => {
    slides.push({
      type: 'content',
      point: p.title,
      detail: p.detail,
      index: i + 2,
      total,
    });
  });

  // 마지막. CTA
  slides.push({
    type: 'cta',
    index: total,
    total,
  });

  return slides;
}

// Satori용 JSX 템플릿 (React.createElement 대신 JSX-like 객체 반환)
// satori는 실제 React가 아닌 JSX element를 받으므로 직접 객체로 구성
export function renderSlide(slide: SlideData, category: string): ReactNode {
  const theme = getTheme(category);
  const categoryLabel = category === 'Hacks' ? '생활정보' :
    category === 'Health' ? '건강' :
    category === 'Tech' ? '테크' :
    category === 'Entertainment' ? '엔터테인먼트' : category;

  if (slide.type === 'cover') {
    return (
      <div style={{
        width: 1080, height: 1350, display: 'flex', flexDirection: 'column',
        background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.sub} 100%)`,
        padding: 80, fontFamily: 'NotoSansKR',
      }}>
        {/* 상단 브랜드 + 카테고리 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>
            {BRAND}
          </div>
          <div style={{
            display: 'flex', fontSize: 24, fontWeight: 600, color: 'white',
            background: 'rgba(255,255,255,0.2)', padding: '12px 28px', borderRadius: 50,
          }}>
            {categoryLabel}
          </div>
        </div>

        {/* 중앙 제목 */}
        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          justifyContent: 'center', alignItems: 'center', gap: 40,
        }}>
          <div style={{
            display: 'flex', fontSize: 64, fontWeight: 900, color: 'white',
            textAlign: 'center', lineHeight: 1.3, maxWidth: 880,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            {slide.title}
          </div>
          {slide.subtitle && (
            <div style={{
              display: 'flex', fontSize: 30, color: 'rgba(255,255,255,0.85)',
              textAlign: 'center', lineHeight: 1.5, maxWidth: 800,
            }}>
              {slide.subtitle}
            </div>
          )}
        </div>

        {/* 하단 페이지 표시 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.6)',
            fontWeight: 500,
          }}>
            {slide.index} / {slide.total}
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === 'content') {
    return (
      <div style={{
        width: 1080, height: 1350, display: 'flex', flexDirection: 'column',
        background: theme.bg, padding: 80, fontFamily: 'NotoSansKR',
      }}>
        {/* 상단 브랜드 + 번호 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: theme.accent, letterSpacing: 4 }}>
            {BRAND}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 28,
            background: theme.accent, color: 'white',
            fontSize: 24, fontWeight: 800,
          }}>
            {(slide.index || 1) - 1}
          </div>
        </div>

        {/* 중앙 콘텐츠 */}
        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          justifyContent: 'center', gap: 48, paddingTop: 40, paddingBottom: 40,
        }}>
          {/* 포인트 제목 */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{
              display: 'flex', width: 80, height: 6, borderRadius: 3,
              background: theme.accent,
            }} />
            <div style={{
              display: 'flex', fontSize: 52, fontWeight: 900, color: theme.text,
              lineHeight: 1.35, maxWidth: 880,
            }}>
              {slide.point}
            </div>
          </div>

          {/* 상세 설명 */}
          <div style={{
            display: 'flex', fontSize: 32, color: theme.text,
            lineHeight: 1.7, maxWidth: 880, opacity: 0.75,
          }}>
            {slide.detail}
          </div>
        </div>

        {/* 하단 페이지 표시 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', fontSize: 22, color: theme.accent, opacity: 0.5,
            fontWeight: 500,
          }}>
            {slide.index} / {slide.total}
          </div>
        </div>
      </div>
    );
  }

  // CTA 슬라이드
  return (
    <div style={{
      width: 1080, height: 1350, display: 'flex', flexDirection: 'column',
      background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.sub} 100%)`,
      padding: 80, fontFamily: 'NotoSansKR',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        justifyContent: 'center', alignItems: 'center', gap: 48,
      }}>
        {/* 로고 크게 */}
        <div style={{
          display: 'flex', fontSize: 48, fontWeight: 900, color: 'white',
          letterSpacing: 8,
        }}>
          {BRAND}
        </div>

        {/* CTA 메시지 */}
        <div style={{
          display: 'flex', fontSize: 44, fontWeight: 800, color: 'white',
          textAlign: 'center', lineHeight: 1.4,
        }}>
          더 자세한 내용이 궁금하다면?
        </div>

        {/* 화살표 */}
        <div style={{
          display: 'flex', fontSize: 60, color: 'rgba(255,255,255,0.8)',
        }}>
          ↓
        </div>

        {/* 프로필 링크 안내 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          background: 'rgba(255,255,255,0.15)',
          padding: '36px 60px', borderRadius: 24,
        }}>
          <div style={{
            display: 'flex', fontSize: 30, fontWeight: 700, color: 'white',
          }}>
            프로필 링크에서 전체 글 보기
          </div>
          <div style={{
            display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.7)',
          }}>
            {SITE_URL}
          </div>
        </div>
      </div>

      {/* 하단 페이지 표시 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.6)',
          fontWeight: 500,
        }}>
          {slide.index} / {slide.total}
        </div>
      </div>
    </div>
  );
}
