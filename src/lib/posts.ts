import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { resolveNanobanana as sharedResolveNanobanana } from './nanobanana';

// CRITICAL: Use process.cwd() mixed with absolute path logic to ensure build-time stability
const postsDirectory = path.resolve(process.cwd(), 'src', 'posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
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
      let fileContents = fs.readFileSync(fullPath, 'utf8');

      // Super Robust Parsing: Find the REAL YAML block starting with 'title:'
      if (fileContents.includes('title:')) {
        const startIndex = fileContents.search(/---[\s\S]*?title:/);
        if (startIndex !== -1) {
          fileContents = fileContents.substring(startIndex);
        }
        fileContents = fileContents.replace(/```markdown/gi, '').replace(/```/g, '').trim();
      }

      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title || slug,
        date: formatDate(matterResult.data.date),
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

  let fileContents = fs.readFileSync(fullPath, 'utf8');

  if (fileContents.includes('title:')) {
    const startIndex = fileContents.search(/---[\s\S]*?title:/);
    if (startIndex !== -1) {
      fileContents = fileContents.substring(startIndex);
    }
    fileContents = fileContents.replace(/```markdown/gi, '').replace(/```/g, '').trim();
  }

  const matterResult = matter(fileContents);

  return {
    slug,
    title: matterResult.data.title || slug,
    date: formatDate(matterResult.data.date),
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
    const fullPost = getPostData(post.slug);
    return (
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      fullPost.content.toLowerCase().includes(lowerQuery)
    );
  });
}

export function resolveNanobanana(text: any): string {
  return sharedResolveNanobanana(text);
}
