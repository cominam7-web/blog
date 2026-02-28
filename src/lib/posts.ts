import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  image?: string;
  content: string;
}

export function getSortedPostsData() {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || '',
        category: matterResult.data.category || 'Hacks',
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

export function getPostData(slug: string): PostData {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  // 파일이 없으면 에러를 던지기보다 기본 데이터를 반환해 빌드 중단을 방지할 수 있음 (또는 404 처리)
  if (!fs.existsSync(fullPath)) {
    return {
      slug,
      title: 'Post Not Found',
      date: '',
      excerpt: '',
      category: '',
      image: '',
      content: '요청하신 포스트를 찾을 수 없습니다.',
    };
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    title: matterResult.data.title || slug,
    date: matterResult.data.date || '',
    excerpt: matterResult.data.excerpt || '',
    category: matterResult.data.category || 'Hacks',
    image: matterResult.data.image || '',
    content: matterResult.content,
  };
}

export function searchPosts(query: string): PostData[] {
  const allPosts = getSortedPostsData();
  const lowerQuery = query.toLowerCase();

  return allPosts.filter(post => {
    // getPostData to get full content for search
    const fullPost = getPostData(post.slug);
    return (
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      fullPost.content.toLowerCase().includes(lowerQuery)
    );
  });
}

export function resolveNanobanana(text: string): string {
  if (!text) return '';

  // Regex to match [나노바나나: {prompt}]
  const nanobananaRegex = /\[나노바나나:\s*(.*?)\]/i;
  const match = text.match(nanobananaRegex);

  if (match) {
    const prompt = match[1];
    // Extract keywords for a fallback image (using Picsum for now as a stable source)
    const keywords = prompt.split(' ').slice(0, 3).join(',').replace(/[^a-zA-Z,]/g, '');
    return `https://picsum.photos/seed/${encodeURIComponent(keywords || 'hacks')}/1200/630`;
  }

  return text; // Return as is if it's already a URL or no tag found
}
