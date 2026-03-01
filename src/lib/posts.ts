import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { resolveNanobanana as sharedResolveNanobanana } from './nanobanana';

// 실행 위치에 관계없이 posts 디렉토리를 탐색 (blog-app 내부 또는 부모 디렉토리에서 실행 모두 지원)
function findPostsDirectory(): string {
  const candidates = [
    path.resolve(process.cwd(), 'src', 'posts'),             // blog-app에서 직접 실행
    path.resolve(process.cwd(), 'blog-app', 'src', 'posts'), // 부모 디렉토리에서 실행
  ];
  return candidates.find(fs.existsSync) ?? candidates[0];
}
const postsDirectory = findPostsDirectory();

export interface PostData {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  image?: string;
  content: string;
}

function formatDate(date: any): string {
  if (!date) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return String(date);
  }
}

// 중복 파싱 로직을 함수로 추출
function parsePostFile(fileContents: string) {
  let contents = fileContents;
  // Gemini가 마크다운 코드 블록으로 감싸서 출력할 경우 제거
  if (contents.includes('title:')) {
    const startIndex = contents.search(/---[\s\S]*?title:/);
    if (startIndex !== -1) {
      contents = contents.substring(startIndex);
    }
    contents = contents.replace(/```markdown/gi, '').replace(/```/g, '').trim();
  }
  return matter(contents);
}

export function getSortedPostsData() {
  if (!fs.existsSync(postsDirectory)) {
    console.error(`Posts directory not found: ${postsDirectory}`);
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = parsePostFile(fileContents);

      return {
        slug,
        title: matterResult.data.title || slug,
        date: formatDate(matterResult.data.date),
        excerpt: matterResult.data.excerpt || '',
        category: matterResult.data.category || 'Hacks',
        tags: Array.isArray(matterResult.data.tags) ? matterResult.data.tags : [],
        image: matterResult.data.image || '',
        content: matterResult.content,
      };
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
}

// 포스트가 없을 경우 null 반환 (이전: 빈 객체 반환으로 notFound()가 호출되지 않는 버그 수정)
export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = parsePostFile(fileContents);

  return {
    slug,
    title: matterResult.data.title || slug,
    date: formatDate(matterResult.data.date),
    excerpt: matterResult.data.excerpt || '',
    category: matterResult.data.category || 'Hacks',
    tags: Array.isArray(matterResult.data.tags) ? matterResult.data.tags : [],
    image: matterResult.data.image || '',
    content: matterResult.content,
  };
}

// getSortedPostsData()가 이미 content를 포함하므로 getPostData()를 재호출하지 않음 (N+1 제거)
export function searchPosts(query: string): PostData[] {
  const allPosts = getSortedPostsData();
  const lowerQuery = query.toLowerCase();

  return allPosts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery)
  );
}

export function resolveNanobanana(text: any): string {
  return sharedResolveNanobanana(text);
}
