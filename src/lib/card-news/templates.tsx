import type { ReactNode } from 'react';

// 카테고리별 컬러 테마 (더 진하고 대비 강한 색상)
const CATEGORY_THEMES: Record<string, { primary: string; secondary: string; dark: string; light: string; gradient: string }> = {
  Hacks: {
    primary: '#1D4ED8', secondary: '#3B82F6', dark: '#0F172A',
    light: '#DBEAFE', gradient: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1D4ED8 100%)',
  },
  Health: {
    primary: '#059669', secondary: '#10B981', dark: '#064E3B',
    light: '#D1FAE5', gradient: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #059669 100%)',
  },
  Tech: {
    primary: '#7C3AED', secondary: '#8B5CF6', dark: '#1E1B4B',
    light: '#EDE9FE', gradient: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #7C3AED 100%)',
  },
  Entertainment: {
    primary: '#DC2626', secondary: '#F43F5E', dark: '#1C1917',
    light: '#FFE4E6', gradient: 'linear-gradient(135deg, #1C1917 0%, #44403C 50%, #DC2626 100%)',
  },
};

function getTheme(category: string) {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES.Hacks;
}

const BRAND = 'ILSANGGAM';
const SITE_URL = 'isglifestudio.kr';

export interface SlideData {
  type: 'cover' | 'intro' | 'content' | 'cta';
  title?: string;
  subtitle?: string;
  intro?: string;
  point?: string;
  detail?: string;
  index?: number;
  total?: number;
  bgImageUrl?: string;
}

export interface CardNewsInput {
  postTitle: string;
  excerpt: string;
  category: string;
  intro: string;
  points: { title: string; detail: string; imagePrompt?: string }[];
  bgImageUrls?: string[];
}

export function buildSlides(input: CardNewsInput): SlideData[] {
  const slides: SlideData[] = [];
  const total = input.points.length + 3; // cover + intro + points + cta
  const bgUrls = input.bgImageUrls || [];

  // 1. COVER
  slides.push({
    type: 'cover',
    title: input.postTitle,
    subtitle: input.excerpt,
    index: 1,
    total,
    bgImageUrl: bgUrls[0],
  });

  // 2. INTRO
  slides.push({
    type: 'intro',
    intro: input.intro || input.excerpt,
    title: input.postTitle,
    index: 2,
    total,
  });

  // 3~N. CONTENT
  input.points.forEach((p, i) => {
    slides.push({
      type: 'content',
      point: p.title,
      detail: p.detail,
      index: i + 3,
      total,
      bgImageUrl: bgUrls[i + 1],
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

export function renderSlide(slide: SlideData, category: string): ReactNode {
  const theme = getTheme(category);
  const categoryLabel = category === 'Hacks' ? '생활정보' :
    category === 'Health' ? '건강' :
    category === 'Tech' ? '테크' :
    category === 'Entertainment' ? '엔터' : category;

  // ─── COVER ───
  if (slide.type === 'cover') {
    return (
      <div style={{
        width: 1080, height: 1350, display: 'flex', flexDirection: 'column',
        background: theme.dark, fontFamily: 'NotoSansKR', position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 배경 이미지 (있으면) */}
        {slide.bgImageUrl && (
          <img
            src={slide.bgImageUrl}
            style={{
              position: 'absolute', top: 0, left: 0, width: 1080, height: 1350,
              objectFit: 'cover', opacity: 0.3,
            }}
          />
        )}
        {/* 그라데이션 오버레이 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 1080, height: 1350,
          display: 'flex',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
        }} />

        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          padding: 80, position: 'relative',
        }}>
          {/* 상단: 카테고리 뱃지 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              display: 'flex', fontSize: 22, fontWeight: 700, color: theme.secondary,
              letterSpacing: 6, textTransform: 'uppercase' as const,
            }}>
              {BRAND}
            </div>
            <div style={{
              display: 'flex', fontSize: 20, fontWeight: 700, color: 'white',
              background: theme.primary, padding: '10px 24px', borderRadius: 8,
              letterSpacing: 2,
            }}>
              {categoryLabel}
            </div>
          </div>

          {/* 중앙: 큰 제목 */}
          <div style={{
            display: 'flex', flexDirection: 'column', flex: 1,
            justifyContent: 'flex-end', gap: 32, paddingBottom: 40,
          }}>
            {/* 장식 라인 */}
            <div style={{
              display: 'flex', width: 60, height: 4, background: theme.primary, borderRadius: 2,
            }} />
            <div style={{
              display: 'flex', fontSize: 58, fontWeight: 900, color: 'white',
              lineHeight: 1.25, maxWidth: 920,
              letterSpacing: -1,
            }}>
              {slide.title}
            </div>
            {slide.subtitle && (
              <div style={{
                display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.6, maxWidth: 800,
              }}>
                {slide.subtitle}
              </div>
            )}
          </div>

          {/* 하단: 페이지 + 스와이프 안내 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>
              {slide.index} / {slide.total}
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.4)', alignItems: 'center', gap: 8 }}>
              밀어서 넘기기 →
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── INTRO ───
  if (slide.type === 'intro') {
    return (
      <div style={{
        width: 1080, height: 1350, display: 'flex', flexDirection: 'column',
        background: theme.gradient, fontFamily: 'NotoSansKR',
        padding: 80,
      }}>
        {/* 상단 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 6 }}>
            {BRAND}
          </div>
          <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>
            {slide.index} / {slide.total}
          </div>
        </div>

        {/* 중앙: 큰 따옴표 + 인트로 */}
        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          justifyContent: 'center', alignItems: 'center', gap: 40,
        }}>
          {/* 장식 따옴표 */}
          <div style={{
            display: 'flex', fontSize: 120, color: theme.secondary, opacity: 0.5,
            fontWeight: 900, lineHeight: 0.8,
          }}>
            "
          </div>

          <div style={{
            display: 'flex', fontSize: 40, fontWeight: 700, color: 'white',
            textAlign: 'center', lineHeight: 1.6, maxWidth: 800,
          }}>
            {slide.intro}
          </div>

          {/* 구분선 */}
          <div style={{
            display: 'flex', width: 80, height: 3, background: theme.secondary, borderRadius: 2,
          }} />

          <div style={{
            display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.5)',
            textAlign: 'center', lineHeight: 1.5,
          }}>
            핵심만 쏙쏙 정리했습니다
          </div>
        </div>
      </div>
    );
  }

  // ─── CONTENT ───
  if (slide.type === 'content') {
    const pointNum = (slide.index || 3) - 2;

    return (
      <div style={{
        width: 1080, height: 1350, display: 'flex', flexDirection: 'column',
        background: '#FFFFFF', fontFamily: 'NotoSansKR',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 배경 이미지 (하단에 크게) */}
        {slide.bgImageUrl && (
          <img
            src={slide.bgImageUrl}
            style={{
              position: 'absolute', bottom: 0, left: 0, width: 1080, height: 700,
              objectFit: 'cover', opacity: 0.15,
            }}
          />
        )}

        {/* 상단 컬러 바 */}
        <div style={{
          display: 'flex', width: 1080, height: 8, background: theme.primary,
        }} />

        <div style={{
          display: 'flex', flexDirection: 'column', flex: 1,
          padding: '60px 80px 80px 80px', position: 'relative',
        }}>
          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, color: theme.primary, letterSpacing: 4 }}>
              {BRAND}
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: '#94A3B8' }}>
              {slide.index} / {slide.total}
            </div>
          </div>

          {/* 포인트 번호 (크게) */}
          <div style={{
            display: 'flex', flexDirection: 'column', flex: 1,
            justifyContent: 'center', gap: 32,
          }}>
            {/* 번호 뱃지 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 64, height: 64, borderRadius: 16,
                background: theme.primary, color: 'white',
                fontSize: 28, fontWeight: 900,
              }}>
                {String(pointNum).padStart(2, '0')}
              </div>
              <div style={{
                display: 'flex', width: 60, height: 3, background: theme.primary, borderRadius: 2,
              }} />
            </div>

            {/* 포인트 제목 */}
            <div style={{
              display: 'flex', fontSize: 48, fontWeight: 900, color: '#0F172A',
              lineHeight: 1.3, maxWidth: 880, letterSpacing: -1,
            }}>
              {slide.point}
            </div>

            {/* 상세 설명 */}
            <div style={{
              display: 'flex', fontSize: 28, color: '#475569',
              lineHeight: 1.8, maxWidth: 860,
            }}>
              {slide.detail}
            </div>

            {/* 하단 구분선 */}
            <div style={{
              display: 'flex', width: 920, height: 1, background: '#E2E8F0',
              marginTop: 20,
            }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── CTA ───
  return (
    <div style={{
      width: 1080, height: 1350, display: 'flex', flexDirection: 'column',
      background: theme.dark, fontFamily: 'NotoSansKR',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 패턴 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 1080, height: 1350,
        display: 'flex',
        background: `radial-gradient(circle at 20% 80%, ${theme.primary}33 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${theme.secondary}22 0%, transparent 50%)`,
      }} />

      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        padding: 80, position: 'relative',
        justifyContent: 'center', alignItems: 'center', gap: 48,
      }}>
        {/* 로고 */}
        <div style={{
          display: 'flex', fontSize: 36, fontWeight: 900, color: theme.secondary,
          letterSpacing: 10,
        }}>
          {BRAND}
        </div>

        {/* 구분선 */}
        <div style={{
          display: 'flex', width: 60, height: 3, background: theme.primary, borderRadius: 2,
        }} />

        {/* CTA 메시지 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            display: 'flex', fontSize: 46, fontWeight: 900, color: 'white',
            textAlign: 'center', lineHeight: 1.4,
          }}>
            더 자세한 내용이
          </div>
          <div style={{
            display: 'flex', fontSize: 46, fontWeight: 900, color: theme.secondary,
            textAlign: 'center', lineHeight: 1.4,
          }}>
            궁금하다면?
          </div>
        </div>

        {/* 프로필 링크 박스 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          background: 'rgba(255,255,255,0.08)',
          border: `1px solid rgba(255,255,255,0.15)`,
          padding: '40px 64px', borderRadius: 20,
          marginTop: 20,
        }}>
          <div style={{
            display: 'flex', fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
            letterSpacing: 2,
          }}>
            LINK IN BIO
          </div>
          <div style={{
            display: 'flex', fontSize: 28, fontWeight: 700, color: 'white',
          }}>
            프로필 링크에서 전체 글 보기
          </div>
          <div style={{
            display: 'flex', fontSize: 24, color: theme.secondary,
            fontWeight: 600,
          }}>
            @ilsanggam
          </div>
        </div>

        {/* 사이트 URL */}
        <div style={{
          display: 'flex', fontSize: 20, color: 'rgba(255,255,255,0.3)',
        }}>
          {SITE_URL}
        </div>
      </div>

      {/* 하단 페이지 */}
      <div style={{
        display: 'flex', justifyContent: 'center', paddingBottom: 40,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.3)' }}>
          {slide.index} / {slide.total}
        </div>
      </div>
    </div>
  );
}
