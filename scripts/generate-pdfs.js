const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Config
const POSTS_DIR = path.join(__dirname, '..', 'src', 'posts');
const GUIDES_DIR = path.join(__dirname, '..', 'public', 'guides');
const FONT_PATH = '/System/Library/Fonts/AppleSDGothicNeo.ttc';
const FOOTER_TEXT = '© 2026 일상감 라이프 스튜디오 | isglifestudio.kr';

const GUIDES = [
  {
    filename: 'money-saving-hacks-2026.pdf',
    category: 'Hacks',
    title: '2026년 돈 아끼는 생활 꿀팁 총정리',
    subtitle: '일상감 라이프 스튜디오',
  },
  {
    filename: 'smart-tech-guide-2026.pdf',
    category: 'Tech',
    title: '스마트한 디지털 생활 가이드',
    subtitle: '일상감 라이프 스튜디오',
  },
  {
    filename: 'health-wellness-guide-2026.pdf',
    category: 'Health',
    title: '내 몸을 지키는 건강 관리 가이드',
    subtitle: '일상감 라이프 스튜디오',
  },
  {
    filename: 'entertainment-picks-2026.pdf',
    category: 'Entertainment',
    title: '정주행 필수! 엔터테인먼트 추천 가이드',
    subtitle: '일상감 라이프 스튜디오',
  },
];

// Strip markdown formatting to plain text
function stripMarkdown(text) {
  return text
    // Remove [나노바나나: ...] image tags (may span multiple lines)
    .replace(/\[나노바나나:[^\]]*\]/g, '')
    // Remove image syntax ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Remove links but keep text [text](url) -> text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove blockquote markers
    .replace(/^>\s?/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove emojis (common unicode ranges)
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{200D}\u{20E3}\u{FE0F}\u{E0020}-\u{E007F}]/gu, '')
    // Remove list markers (-, *, numbered)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Read and parse all posts
function loadPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      const { data, content } = matter(raw);
      if (data.title && data.category) {
        posts.push({
          title: data.title.replace(/^'+|'+$/g, ''),
          date: data.date,
          category: data.category,
          excerpt: data.excerpt || '',
          content: stripMarkdown(content),
        });
      }
    } catch (e) {
      console.warn(`Skipping ${file}: ${e.message}`);
    }
  }
  return posts;
}

// Add footer to every page
function addFooter(doc) {
  const bottom = doc.page.height - 40;
  doc.save();
  doc.font('KoreanLight').fontSize(8).fillColor('#999999');
  doc.text(FOOTER_TEXT, 50, bottom, { align: 'center', width: doc.page.width - 100 });
  doc.restore();
}

// Generate a single PDF guide
function generatePDF(guide, posts) {
  return new Promise((resolve, reject) => {
    const categoryPosts = posts.filter(p => p.category === guide.category);
    if (categoryPosts.length === 0) {
      console.warn(`No posts found for category: ${guide.category}`);
      resolve();
      return;
    }

    // Sort by date
    categoryPosts.sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0);
      const db = b.date ? new Date(b.date) : new Date(0);
      return da - db;
    });

    const filePath = path.join(GUIDES_DIR, guide.filename);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 55, right: 55 },
      bufferPages: true,
      info: {
        Title: `${guide.title} - ${guide.subtitle}`,
        Author: '일상감 라이프 스튜디오',
        Creator: 'isglifestudio.kr',
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Register fonts
    doc.registerFont('KoreanBold', FONT_PATH, 'AppleSDGothicNeo-Bold');
    doc.registerFont('Korean', FONT_PATH, 'AppleSDGothicNeo-Regular');
    doc.registerFont('KoreanLight', FONT_PATH, 'AppleSDGothicNeo-Light');
    doc.registerFont('KoreanMedium', FONT_PATH, 'AppleSDGothicNeo-Medium');
    doc.registerFont('KoreanSemiBold', FONT_PATH, 'AppleSDGothicNeo-SemiBold');

    // ===== TITLE PAGE =====
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a2e');

    // Decorative line
    const centerX = doc.page.width / 2;
    doc.save();
    doc.moveTo(centerX - 80, 260).lineTo(centerX + 80, 260).lineWidth(2).stroke('#e94560');
    doc.restore();

    // Title
    doc.font('KoreanBold').fontSize(28).fillColor('#ffffff');
    doc.text(guide.title, 55, 290, {
      align: 'center',
      width: doc.page.width - 110,
    });

    // Subtitle
    doc.moveDown(1);
    doc.font('KoreanLight').fontSize(16).fillColor('#e94560');
    doc.text(guide.subtitle, 55, doc.y, {
      align: 'center',
      width: doc.page.width - 110,
    });

    // Post count
    doc.moveDown(2);
    doc.font('KoreanLight').fontSize(12).fillColor('#aaaaaa');
    doc.text(`총 ${categoryPosts.length}편의 글 수록`, 55, doc.y, {
      align: 'center',
      width: doc.page.width - 110,
    });

    // Decorative line bottom
    doc.save();
    doc.moveTo(centerX - 80, doc.y + 30).lineTo(centerX + 80, doc.y + 30).lineWidth(2).stroke('#e94560');
    doc.restore();

    // Year
    doc.font('KoreanLight').fontSize(11).fillColor('#666666');
    doc.text('2026', 55, doc.page.height - 120, {
      align: 'center',
      width: doc.page.width - 110,
    });

    // ===== TABLE OF CONTENTS =====
    doc.addPage();
    doc.rect(0, 0, doc.page.width, 100).fill('#1a1a2e');
    doc.font('KoreanBold').fontSize(22).fillColor('#ffffff');
    doc.text('목차', 55, 35, { align: 'center', width: doc.page.width - 110 });

    let tocY = 130;
    doc.fillColor('#333333');
    categoryPosts.forEach((post, i) => {
      if (tocY > doc.page.height - 80) {
        doc.addPage();
        tocY = 60;
      }
      // Number
      doc.font('KoreanBold').fontSize(11).fillColor('#e94560');
      doc.text(`${String(i + 1).padStart(2, '0')}`, 55, tocY);
      // Title
      doc.font('KoreanMedium').fontSize(11).fillColor('#333333');
      doc.text(post.title, 85, tocY, { width: doc.page.width - 160 });
      tocY = doc.y + 12;
    });

    // ===== CONTENT PAGES =====
    categoryPosts.forEach((post, index) => {
      doc.addPage();

      // Section header bar
      doc.rect(0, 0, doc.page.width, 6).fill('#e94560');

      // Post number
      doc.font('KoreanBold').fontSize(11).fillColor('#e94560');
      doc.text(`${String(index + 1).padStart(2, '0')} / ${String(categoryPosts.length).padStart(2, '0')}`, 55, 25, {
        align: 'right',
        width: doc.page.width - 110,
      });

      // Post title
      doc.font('KoreanBold').fontSize(20).fillColor('#1a1a2e');
      doc.text(post.title, 55, 50, { width: doc.page.width - 110 });

      // Separator
      const sepY = doc.y + 10;
      doc.save();
      doc.moveTo(55, sepY).lineTo(200, sepY).lineWidth(1.5).stroke('#e94560');
      doc.restore();

      // Excerpt if available
      if (post.excerpt) {
        doc.font('KoreanLight').fontSize(10).fillColor('#666666');
        doc.text(post.excerpt, 55, sepY + 15, { width: doc.page.width - 110 });
        doc.moveDown(1);
      }

      // Content
      const contentY = doc.y + 10;
      doc.font('Korean').fontSize(10.5).fillColor('#333333');

      // Split content into paragraphs and render
      const paragraphs = post.content.split(/\n\n+/);
      let currentY = contentY;

      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        // Check if we need a new page
        const textHeight = doc.heightOfString(trimmed, {
          width: doc.page.width - 110,
        });

        if (currentY + textHeight > doc.page.height - 70) {
          doc.addPage();
          currentY = 60;
        }

        doc.font('Korean').fontSize(10.5).fillColor('#333333');
        doc.text(trimmed, 55, currentY, {
          width: doc.page.width - 110,
          lineGap: 5,
        });
        currentY = doc.y + 10;
      }
    });

    // ===== ADD FOOTERS TO ALL PAGES (except title page) =====
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 1; i < pageCount; i++) {
      doc.switchToPage(i);
      addFooter(doc);
      // Page number
      doc.save();
      doc.font('KoreanLight').fontSize(8).fillColor('#999999');
      doc.text(`${i} / ${pageCount - 1}`, 55, doc.page.height - 40, {
        align: 'right',
        width: doc.page.width - 110,
      });
      doc.restore();
    }

    doc.end();

    stream.on('finish', () => {
      const stat = fs.statSync(filePath);
      const sizeKB = (stat.size / 1024).toFixed(1);
      console.log(`  Created: ${guide.filename} (${sizeKB} KB, ${categoryPosts.length} posts, ${pageCount} pages)`);
      resolve();
    });
    stream.on('error', reject);
  });
}

async function main() {
  console.log('Loading posts...');
  const posts = loadPosts();
  console.log(`Found ${posts.length} total posts\n`);

  // Show category breakdown
  const catCounts = {};
  posts.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  console.log('Category breakdown:');
  Object.entries(catCounts).sort().forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} posts`);
  });
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(GUIDES_DIR)) {
    fs.mkdirSync(GUIDES_DIR, { recursive: true });
  }

  console.log('Generating PDFs...');
  for (const guide of GUIDES) {
    await generatePDF(guide, posts);
  }
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
