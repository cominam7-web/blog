# Blog Design Research Report: Patterns & Best Practices (2025-2026)

## Table of Contents
1. [Korean Lifestyle/Info Blogs](#1-korean-lifestyleinfo-blogs)
2. [International Successful Blogs](#2-international-successful-blogs)
3. [Korean Naver/Tistory Top Bloggers](#3-korean-navertistory-top-bloggers)
4. [Cross-Cutting Design Patterns](#4-cross-cutting-design-patterns)
5. [2025-2026 Design Trends](#5-2025-2026-design-trends)
6. [Actionable Recommendations](#6-actionable-recommendations)

---

## 1. Korean Lifestyle/Info Blogs

### 1.1 오늘의집 (Ohouse) Magazine

**Page Layout Structure**
- **Header:** Minimal sticky header with logo, search bar, and category navigation tabs (집들이, 노하우, 전문가집들이, etc.)
- **Hero:** Full-width featured content carousel with large lifestyle photography
- **Content Area:** Card-based grid layout (2-3 columns on desktop, single column on mobile) with masonry-style image arrangements
- **Sidebar:** No traditional sidebar; uses full-width content with filter systems at the top
- **Footer:** Multi-column mega footer with service links, app download CTAs, and social media links

**Typography & Visual Design**
- Clean sans-serif fonts (Noto Sans KR / Pretendard family)
- High contrast between images and minimal text overlays
- Neutral, warm color palette: whites, light grays, with accent colors from content imagery
- Content tags and metadata in smaller, muted gray text

**Post Detail Page (집들이)**
- Large hero image at top (full-width or near full-width)
- Author profile section with follow button
- Photo-heavy content: large inline images with product tags overlaid
- Product information cards embedded within content (clickable to shop)
- Social proof: 좋아요 (likes), 댓글 (comments), 스크랩 (bookmarks) prominently displayed
- Related 집들이 recommendations at bottom

**Navigation & Categories**
- Top horizontal tab navigation for major categories
- Extensive filter system: by room type, home size (평수), style, budget
- Tag-based content discovery

**Key UX Philosophy**
- "시각적으로 강조하지 않더라도, 유저가 이해하기 쉬운 구조로 잘 정리해서 보여주는 것이 가장 효과적" (Even without visual emphasis, organizing content in an easily understandable structure is most effective)
- Commerce-integrated content: seamless bridge from inspiration to purchase

---

### 1.2 Brunch (브런치스토리 by Kakao)

**Page Layout Structure**
- **Header:** Ultra-minimal header with just logo and search; near-invisible navigation
- **Hero:** Clean typography-focused hero on homepage with curated content picks
- **Content Area:** Single-column, centered reading layout (magazine/book aesthetic)
- **Sidebar:** None on article pages; completely distraction-free
- **Footer:** Minimal with author info and related articles

**Typography & Visual Design**
- Book-like aesthetic prioritizing readability and storytelling
- Serif and clean sans-serif combination for Korean/English text
- Generous line height and letter spacing optimized for Korean long-form reading
- Maximum content width ~680px (similar to Medium's approach)
- Muted, restrained color palette: mostly black text on white, minimal accent colors

**Post Detail Page**
- Large cover image (full-width or centered)
- Article title in large, bold typography
- Author byline with small profile photo
- Clean body text with ample whitespace
- Minimal inline UI elements; the text is the experience
- "Magazine" grouping: articles can be organized into series/magazines by the author
- Bottom: author bio card, related articles from same author, and curated recommendations

**Content Quality Control**
- Selective writer approval process (application required to publish)
- Quality-over-quantity philosophy
- Minimized UI beyond writing to help focus on content

**Platform Integration**
- KakaoTalk Channels, KakaoView, and Daum Search integration for distribution
- Share to KakaoTalk as primary social sharing mechanism

---

### 1.3 집꾸미기 (Zipgurmigi)

**Page Layout Structure**
- Similar to 오늘의집 but more e-commerce focused
- Card grid layout for browsing interior inspiration content
- Product-tagged content with direct purchase links
- Category-based navigation with lifestyle/room type filters

---

## 2. International Successful Blogs

### 2.1 Medium

**Page Layout Structure**
- **Header:** Minimal sticky header with logo, search, write button, and user avatar
- **Hero (Homepage):** Personalized feed based on interests and following
- **Content Area:** Single-column feed on homepage; single-column reading on articles
- **Sidebar:** Minimal right sidebar on homepage (trending, recommended topics); none on article pages
- **Footer:** Simple, minimal footer

**Typography (The Gold Standard for Blog Reading)**
- Body text: ~21px serif font (Charter/custom serif), optimized for screen reading
- Line length: ~75 characters per line (does NOT span full width)
- Line height: 1.5-1.6x (approximately 32px for 21px body text)
- Generous paragraph spacing
- Headlines: Bold sans-serif, clear hierarchy (H1 ~40px, H2 ~30px, H3 ~24px)
- Pull quotes and highlights use distinct visual treatment

**Post Detail Page**
- Large featured image (optional, author-controlled)
- Title + subtitle in large typography
- Author bar: avatar, name, date, estimated reading time (e.g., "5 min read")
- Clean body content area, max-width ~680px centered
- Inline images with optional captions
- Highlight/annotation system (readers can highlight text)
- Clap button (floating or inline) for engagement
- Bottom: author bio, "More from [author]", related articles
- Response/comment section below article

**Social Proof Elements**
- Estimated read time (prominently displayed)
- Clap count visible on article cards and within articles
- Response (comment) count
- "Member-only" badge for premium content

**Newsletter/Subscription**
- Inline "Follow" buttons for authors
- End-of-article subscription prompt
- Pop-up subscription modal (triggered on scroll or exit intent)

---

### 2.2 Smashing Magazine

**Page Layout Structure**
- **Header:** Full navigation bar with categories, search, and membership CTA
- **Hero:** Featured article with large image and bold typography
- **Content Area:** Multi-column grid on homepage; single-column for articles
- **Sidebar:** Right sidebar with table of contents (sticky), newsletter signup, and ads on article pages
- **Footer:** Comprehensive mega footer with categories, about, and newsletter signup

**Typography**
- Body: ~18-20px, serif or clean sans-serif for readability
- Headlines: 24-26px+ bold
- Code blocks with monospace font, syntax highlighting
- Strong typographic hierarchy with clear H1/H2/H3 distinction
- Line height ratio: approximately 1.48x body font size

**Post Detail Page**
- Category label at top
- Large article title
- Author info with avatar, publication date, estimated read time
- Sticky table of contents in sidebar (desktop)
- Code examples with copy-to-clipboard functionality
- Inline images, diagrams, and CodePen embeds
- Author bio section at bottom
- Related articles grid
- Comment section (community-driven)

**Ad Placement Strategy**
- Sidebar ads (non-intrusive, clearly labeled)
- Between-section native content ads
- Sponsored content clearly marked as "Sponsored"
- No pop-ups or interstitials

**Navigation & Categories**
- Mega menu with clear category groupings (CSS, JS, UX, Design, etc.)
- "Guides" section for curated learning paths
- Tag-based article discovery

---

### 2.3 The Verge

**Page Layout Structure**
- **Header:** Bold branding with primary navigation categories
- **Hero (Homepage):** Transformed into "Storystream" feed mixing articles, tweets, quick blurbs, and links
- **Content Area:** Two-column layout (main content + sidebar cards)
- **Sidebar:** Quick links, trending, and related content
- **Footer:** Standard news site footer

**Design Philosophy**
- Built mobile-first (90% of audience visits on phones)
- Desktop is secondary consideration
- Text-dominant design over image-heavy approach
- Dark color scheme (white-on-black text option)
- Bold, editorial typography with custom typefaces

**Post Detail Page**
- Large hero image
- Bold headline typography
- Author byline with timestamp
- Full-width content area on article pages
- Embedded media (video, social posts)
- Related content recommendations
- Comment system

**Key Lessons**
- Mixed reception to the Storystream approach
- Some users found the redesign chaotic
- White-on-black text readability was a concern
- Lesson: bold design choices need accessibility validation

---

### 2.4 CSS-Tricks (now part of DigitalOcean)

**Page Layout Structure**
- Developer-focused blog with search-first approach
- Category and tag-heavy navigation
- Code-oriented content with syntax highlighting
- Almanac/reference section alongside blog posts
- Clean, functional design prioritizing code readability

---

## 3. Korean Naver/Tistory Top Bloggers

### 3.1 Naver Blog (네이버 블로그)

**Platform Statistics (2025)**
- 3억3천만 posts published in 2025 (all-time record)
- 4,500만+ monthly unique visitors
- 매일 40만건 new neighbor (이웃) connections daily

**Page Layout Structure**
- **Header:** Blog title/logo, profile area, neighbor (이웃) count
- **Content Area:** Single-column post feed OR magazine-style layout (skin-dependent)
- **Sidebar:** Category list, calendar widget, visitor counter, neighbor list, profile section
- **Footer:** Blog statistics, copyright

**Typography & Visual Design**
- Platform-constrained fonts (Nanum fonts family: 나눔고딕, 나눔명조)
- Variable quality: depends heavily on individual blogger's skill
- Top bloggers use consistent font sizes (본문 15-17px), clear headings
- Heavy use of bold, color, and size for emphasis within post editor

**Post Detail Page Structure (Top Bloggers)**
- Title with category label
- Date, view count prominently displayed
- Photo-heavy content (especially for food, travel, lifestyle)
- Structured sections with bold headings
- Product/place information blocks (map embeds, contact info)
- Social proof at bottom: 공감 (empathy/like), 댓글 (comments), 이웃추가 (add neighbor)
- Related posts by same blogger
- Blog home link

**Navigation & Categories**
- Left sidebar category tree (traditional blog structure)
- "프롤로그" overview page
- Tag system for cross-blog discovery

**Recent Platform Updates (2025)**
- "글감 피드" (Topic Feed): browse posts about same topic (movies, books, music)
- AI-personalized "블로그 홈" based on interests and neighbor activity
- "왓츠인마이블로그" challenge drove engagement among MZ generation (80% participation from 10s-30s)
- Topic-attached posts grew 77% YoY to ~70 million

**Ad Placement (Naver Blog)**
- AdPost system integrated by Naver
- Ads appear between content sections
- Top/bottom of post banner areas
- Sidebar ad slots

**Social Proof Elements**
- 공감 (empathy) button with count
- 댓글 (comment) count and section
- 조회수 (view count) visible
- 이웃 (neighbor/follower) count on profile
- Blog ranking/level indicators (파워블로그 badge)

---

### 3.2 Tistory (티스토리)

**Page Layout Structure**
- **Highly customizable** through skin/template system
- Top bloggers often use custom HTML/CSS skins
- Common structure: header banner, navigation menu, content area, sidebar, footer
- Magazine-style homepages with card grids popular among top bloggers

**Typography**
- More freedom than Naver Blog for custom fonts
- Top bloggers typically use: Pretendard, Noto Sans KR, or Spoqa Han Sans
- Body text: 16-18px
- Generous line spacing for Korean text readability

**Post Detail Page (Revenue-Focused Bloggers)**
- SEO-optimized titles (keyword-rich)
- Table of contents at the top (common among info bloggers)
- Structured with clear H2/H3 headings
- Inline images optimized for Google/Naver image search
- Ad placements: Google AdSense integrated between paragraphs
- Call-to-action for related posts at bottom
- Comment section (Tistory native or Disqus)

**Ad Integration (Revenue Bloggers)**
- Google AdSense as primary revenue source
- Ad placements: after first paragraph, mid-content, end of content
- Sidebar sticky ads
- Mobile: between-paragraph ads that don't break reading flow
- Best practice: maximum 3-4 ads per post to maintain UX

**Popular Content Categories**
- IT/개발 (development), 맛집 (restaurants), 여행 (travel), 재테크 (finance), 건강 (health)

---

## 4. Cross-Cutting Design Patterns

### 4.1 Page Layout Structure Summary

| Element | Korean Lifestyle | International Tech | Korean Platform Blogs |
|---------|-----------------|--------------------|-----------------------|
| Header | Minimal, sticky | Nav-heavy, categorized | Platform-standard |
| Hero | Image-driven carousel | Typography + featured article | Skin-dependent |
| Content | Card grid / single column | Single column reading | Single column + sidebar |
| Sidebar | Rare / filter-based | TOC + newsletter + ads | Category list + widgets |
| Footer | Mega footer + CTA | Comprehensive | Minimal |

### 4.2 Typography Best Practices (Consensus)

| Property | Recommended Value | Notes |
|----------|------------------|-------|
| Body font size | 16-21px | 18px is the sweet spot for most blogs |
| Line height | 1.48-1.6x font size | 1.5x is most common |
| Line length | 50-75 characters | ~680px max content width |
| Paragraph spacing | 1.5-2x line height | Clear separation between paragraphs |
| Heading scale | H1: 2-2.5x, H2: 1.5-1.8x, H3: 1.2-1.4x body | Clear hierarchy |
| Korean text | +1-2px larger body, +0.05em letter spacing | Korean characters need slightly more space |

### 4.3 Color Scheme Patterns

**The 60-30-10 Rule:**
- 60% dominant neutral color (white/off-white or dark background)
- 30% secondary color (light gray, muted tones)
- 10% accent color (brand color for CTAs, links, highlights)

**Common Approaches:**
- **Minimalist blogs** (Medium, Brunch): White background, black/dark gray text, single accent color
- **Lifestyle blogs** (오늘의집): Warm neutrals, whites, with color coming from photography
- **Tech blogs** (Smashing): White + brand color accent, with dark code blocks
- **Dark mode**: Trending but with restraint; dark background + single bright accent

### 4.4 Mobile Responsiveness Patterns

1. **Single-column collapse**: Multi-column grids collapse to single column on mobile
2. **Sidebar disappears**: Sidebar content moves to bottom or becomes expandable drawer
3. **Card stacking**: Grid cards stack vertically with consistent spacing
4. **Sticky elements**: Only header and bottom nav remain sticky on mobile
5. **Touch targets**: Minimum 44x44px for all interactive elements
6. **Font scaling**: Body text stays 16px+ on mobile (never smaller)
7. **Image handling**: Full-width images on mobile, lazy-loaded

**Breakpoints (2025 standard):**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Wide: > 1440px

### 4.5 Post Detail Page Structure (Best-in-Class)

```
┌─────────────────────────────────────────────┐
│  Sticky Header (minimal: logo + nav)         │
├─────────────────────────────────────────────┤
│  Category Label                              │
│  Article Title (H1, large, bold)             │
│  Subtitle / Excerpt                          │
│  Author Info | Date | Read Time | Views      │
├─────────────────────────────────────────────┤
│  Hero Image (full-width or content-width)    │
│  Image Caption                               │
├──────────────────────┬──────────────────────┤
│                      │  Sticky Sidebar:     │
│  Article Body        │  - Table of Contents │
│  (max ~700px)        │  - Newsletter CTA    │
│                      │  - Social Share      │
│  H2 Section          │  - Ad (optional)     │
│  Paragraph text...   │                      │
│  Inline image        │                      │
│  H2 Section          │                      │
│  Paragraph text...   │                      │
│                      │                      │
├──────────────────────┴──────────────────────┤
│  Author Bio Card                             │
│  Newsletter Subscription CTA                 │
│  Related Articles Grid (3-4 cards)           │
│  Comment Section                             │
├─────────────────────────────────────────────┤
│  Footer                                      │
└─────────────────────────────────────────────┘
```

### 4.6 Navigation & Category Systems

**Patterns ranked by effectiveness:**
1. **Top horizontal navigation** with major categories (5-7 items max)
2. **Mega menu** for content-rich sites with subcategories
3. **Tag cloud / topic pills** for cross-cutting discovery
4. **Search-first** approach (prominent search bar) for large archives
5. **Hamburger menu** on mobile (with full category access)

### 4.7 Social Proof Elements

| Element | Placement | Priority |
|---------|-----------|----------|
| Estimated read time | Below title, next to date | High |
| View/read count | Below title or at article end | Medium |
| Like/clap count | Floating sidebar or article end | High |
| Comment count | Below title (linked to comments) | Medium |
| Share buttons | Floating sidebar or below title | Medium |
| Author followers | Author bio section | Low |
| "Trending" badge | Article card on listing pages | Medium |

### 4.8 Newsletter/Subscription UX

**Placement strategies (by conversion rate):**
1. **End-of-article CTA** (highest intent: reader just finished your content)
2. **Sticky bottom bar** (persistent but non-intrusive)
3. **Inline mid-content** (between sections, styled as a callout box)
4. **Exit-intent popup** (use sparingly; can annoy)
5. **Slide-in from corner** (less intrusive than full popup)
6. **Header/top bar** (good for site-wide announcements)

**Best practices:**
- Single email field + submit button (reduce friction)
- Clear value proposition ("주간 인테리어 트렌드를 받아보세요" / "Get weekly design tips")
- Social proof in CTA ("Join 10,000+ readers")
- Mobile: bottom bar or end-of-article only (no popups)

### 4.9 Ad Placement Without Hurting UX

**Acceptable placements:**
1. Sidebar (sticky, desktop only)
2. Between content sections (after H2 headings, natural reading pauses)
3. After article content (before related posts)
4. Native/sponsored content clearly labeled

**Rules:**
- Never more than 3-4 ads per article
- Never before the first paragraph
- Lazy-load below-fold ads for performance
- Match ad styling to site design where possible
- Always label ads as "Advertisement" / "광고"
- Mobile: only between-paragraph placements (no sidebars)
- Implement frequency capping

### 4.10 Image Handling

| Image Type | Dimensions | Notes |
|------------|-----------|-------|
| Hero/Cover | 16:9 or 3:2, min 1200px wide | Full-width or content-width |
| Inline content | Content-width (max ~700px) | With optional caption |
| Thumbnails (card) | 16:9 or 4:3, ~400px wide | Consistent aspect ratio across cards |
| Author avatar | 40-48px circle | Used in bylines and comments |
| Open Graph | 1200x630px | For social sharing previews |

**Best practices:**
- WebP/AVIF format with JPEG fallback
- Lazy loading for all below-fold images
- Blur placeholder (LQIP) while loading
- Responsive srcset for different screen sizes
- Alt text for accessibility
- Caption support for editorial content

### 4.11 Reading Experience Optimizations

| Feature | Impact | Implementation |
|---------|--------|----------------|
| Reading progress bar | High engagement | Horizontal bar at top of viewport, fills as user scrolls |
| Table of contents | High for long posts | Sticky sidebar (desktop), expandable drawer (mobile) |
| Estimated read time | Medium engagement | Calculate: words / 200 WPM (Korean: words / 500 CPM) |
| Back to top button | Convenience | Appears after scrolling past first section |
| Text highlighting | Medium engagement | Allow readers to highlight and share quotes |
| Dark mode toggle | Accessibility | Respect system preference, offer manual toggle |
| Font size controls | Accessibility | A-/A+ buttons for user preference |

### 4.12 Footer & Related Content

**Footer Structure:**
```
┌─────────────────────────────────────────────┐
│  Related Articles (3-4 card grid)            │
│  - Thumbnail | Title | Excerpt | Read time   │
├─────────────────────────────────────────────┤
│  Newsletter Signup (full-width CTA bar)       │
├─────────────────────────────────────────────┤
│  Footer Navigation                            │
│  Col 1: Categories    Col 2: About/Contact    │
│  Col 3: Legal/Privacy Col 4: Social Links     │
├─────────────────────────────────────────────┤
│  Copyright | Language Selector                │
└─────────────────────────────────────────────┘
```

**Related content strategies:**
- "More from this author" (personal blogs)
- "Related articles" based on tags/categories
- "Popular this week" (social proof-driven)
- "You might also like" (AI/algorithm-driven)
- Mix of 2-3 strategies for best content discovery

---

## 5. 2025-2026 Design Trends

### Typography
- **Variable fonts**: Single font file that smoothly scales across weights and widths
- **Serif revival**: Modern serifs with sharper details, higher contrast for editorial blogs
- **Fluid typography**: `clamp()` CSS function for responsive type that scales between breakpoints
- **Korean typography**: Pretendard and Noto Sans KR dominating; increased attention to Korean-specific line-height and letter-spacing

### Layout
- **Bento grids**: Modular, asymmetric card layouts inspired by Japanese lunch boxes
- **Organic shapes**: Soft curves replacing hard geometric edges
- **Container queries**: Components that respond to their container size, not just viewport
- **CSS Subgrid**: Nested grid alignment for cleaner card layouts

### Visual Design
- **Soft, warm color palettes**: Moving away from stark whites toward warm off-whites and cream
- **Dark mode as standard**: Not optional; expected by users
- **Micro-animations**: Subtle interactions (button bounces, smooth transitions) for delight
- **Dimensional design**: Subtle depth through shadows and layering

### UX & Accessibility
- **AI-driven personalization**: Content recommendations based on reading history
- **Inclusive design as default**: High contrast, screen reader support, keyboard navigation
- **Mobile-first is non-negotiable**: 90%+ traffic is mobile for most blogs
- **Performance-first**: Core Web Vitals as a design constraint

---

## 6. Actionable Recommendations

Based on this research, here are the top priorities for a new blog project:

### Must-Have Features
1. **Single-column article layout** with max-width ~700px and generous whitespace
2. **Clean typography**: 18px body, 1.5x line height, proper Korean text optimization
3. **Estimated read time** displayed below article title
4. **Mobile-first responsive design** with card grid that collapses gracefully
5. **Dark mode support** (respecting system preference)
6. **Lazy-loaded images** with blur placeholders
7. **Related articles** section at bottom of each post
8. **Newsletter subscription CTA** at end of articles
9. **SEO-optimized meta tags** and Open Graph images
10. **Fast performance** (target < 2s LCP)

### Nice-to-Have Features
1. Reading progress bar (top of viewport)
2. Sticky table of contents (for long posts)
3. Social share buttons (floating sidebar on desktop)
4. Comment/reaction system (likes, comments)
5. Author bio card
6. Tag-based content discovery
7. Search functionality
8. View count display
9. Back-to-top button
10. Text highlight & share

### Design Principles to Follow
1. **Content is king**: Minimize UI chrome; let the writing shine
2. **Consistent visual hierarchy**: Use the typographic scale religiously
3. **60-30-10 color rule**: Neutral dominant, muted secondary, bold accent
4. **Whitespace is a feature**: At least 15-20% empty space to avoid clutter
5. **Progressive disclosure**: Show essential info first, details on demand
6. **Accessibility first**: WCAG 2.1 AA compliance minimum

---

## Sources

- [Adobe Design Trends 2026](https://www.adobe.com/express/learn/blog/design-trends-2026)
- [12 UI/UX Design Trends for 2026](https://www.index.dev/blog/ui-ux-design-trends)
- [Wix Web Design Trends 2026](https://www.wix.com/blog/web-design-trends)
- [Typography Trends 2026](https://www.designmonks.co/blog/typography-trends-2026)
- [Figma Web Design Trends](https://www.figma.com/resource-library/web-design-trends/)
- [Muzli Web Design Trends 2026](https://muz.li/blog/web-design-trends-2026/)
- [오늘의집 디자인팀 블로그](https://www.bucketplace.com/post/2023-08-29-%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-%EB%94%94%EC%9E%90%EC%9D%B8%ED%8C%80%EC%9D%80-%EC%96%B4%EB%96%BB%EA%B2%8C-%EC%9D%BC%ED%95%98%EB%82%98%EC%9A%94/)
- [Brunch Story Platform Analysis (InterAd)](https://www.interad.com/en/insights/kakao-brunch-platform-for-long-form-writing)
- [Kakao Brunch Explained (Inquivix)](https://inquivix.com/kakao-brunch/)
- [The Verge Redesign Analysis](https://theunshut.javipas.com/2022/09/14/the-verge-redesign-an-analysis/)
- [The Verge Goes Back to Bloggy Basics (Nieman Lab)](https://www.niemanlab.org/2022/09/the-verge-goes-back-to-bloggy-basics-with-a-new-redesign/)
- [Smashing Magazine Typography Guidelines](https://www.smashingmagazine.com/2012/07/typography-guidelines-and-references/)
- [Smashing Magazine Typographic Design Patterns](https://www.smashingmagazine.com/2009/08/typographic-design-survey-best-practices-from-the-best-blogs/)
- [Medium Typography UX Analysis](https://medium.com/design-bootcamp/the-perfect-text-readability-recipe-science-backed-typography-for-better-ux-7c8bf190df85)
- [Blog Article Page UX Case Study](https://medium.com/@djtapaniya/designing-blog-article-page-ux-case-study-4daf25619ffc)
- [Optimal Typography for Web Design 2025](https://www.elegantthemes.com/blog/design/optimal-typography-for-web-design)
- [Blog Typography Ultimate Guide](https://bloggingx.com/blog-typography/)
- [12 Blog Design Best Practices 2025](https://www.waseembashir.com/post/7-blog-design-best-practices)
- [네이버 2025 블로그 리포트](https://news.nate.com/view/20251222n18223)
- [네이버 블로그 역대 최대 규모](https://zdnet.co.kr/view/?no=20251222220821)
- [CTA Placement Strategies 2026](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages)
- [Ad Placement Best Practices (MonetizeMore)](https://www.monetizemore.com/blog/publisher-ultimate-guide-ad-placements/)
- [Ad Placement Strategies 2025](https://denote.net/blog/ad-placement)
- [Footer UX Patterns 2026](https://www.eleken.co/blog-posts/footer-ux)
- [UX Guidelines for Recommended Content (NN/g)](https://www.nngroup.com/articles/recommendation-guidelines/)
- [Blog UX Trends and Tools (Gravatar)](https://blog.gravatar.com/2024/12/23/blog-ux-best-practices/)
- [Card UI Design Examples 2025](https://bricxlabs.com/blogs/card-ui-design-examples)
- [Responsive Web Design Techniques 2026](https://lovable.dev/guides/responsive-web-design-techniques-that-work)
- [Modern Website Color Schemes 2025](https://colorhero.io/blog/modern-website-color-schemes-2025)
- [Blog Design Examples 2026](https://www.sitebuilderreport.com/inspiration/blog-design-examples)
- [Best Blog Designs 2025](https://www.optimizepress.com/best-blog-designs/)
- [2025 웹 디자인 트렌드 (Superbee)](https://superbee.co.kr/Blog_/2022%EB%85%84%EC%97%90-%EC%A3%BC%EB%AA%A9%ED%95%B4%EC%95%BC-%ED%95%A0-10%EB%8C%80-%EC%9B%B9-%EB%94%94%EC%9E%90%EC%9D%B8-%ED%8A%B8%EB%A0%8C%EB%93%9C/)
