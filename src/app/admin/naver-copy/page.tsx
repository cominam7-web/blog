'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

interface PostItem {
  slug: string;
  title: string;
  category: string;
  date: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Hacks: 'bg-blue-100 text-blue-700',
  Health: 'bg-green-100 text-green-700',
  Tech: 'bg-purple-100 text-purple-700',
  Entertainment: 'bg-rose-100 text-rose-700',
};

export default function NaverCopyPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch('/api/card-news')
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => setError('포스트 목록을 불러오지 못했습니다.'));
  }, []);

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPost = posts.find(p => p.slug === selectedSlug);

  async function handleLoad() {
    if (!selectedSlug) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await adminFetch(`/api/naver-copy?slug=${selectedSlug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || '변환에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyHtml() {
    if (!result?.html) return;
    try {
      const blob = new Blob([result.html], { type: 'text/html' });
      const textBlob = new Blob([result.plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': textBlob,
        }),
      ]);
      setCopied('html');
      setTimeout(() => setCopied(''), 2000);
    } catch {
      // fallback
      await navigator.clipboard.writeText(result.plainText);
      setCopied('text');
      setTimeout(() => setCopied(''), 2000);
    }
  }

  async function handleCopyText() {
    if (!result?.plainText) return;
    await navigator.clipboard.writeText(result.plainText);
    setCopied('text');
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleCopyTitle() {
    if (!result?.title) return;
    await navigator.clipboard.writeText(result.title);
    setCopied('title');
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleCopyTags() {
    if (!result?.tags) return;
    await navigator.clipboard.writeText(result.tags.join(', '));
    setCopied('tags');
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 mb-2">네이버 블로그 복사</h1>
      <p className="text-sm text-slate-500 mb-6">블로그 글을 네이버 블로그에 붙여넣기할 수 있는 형식으로 변환합니다.</p>

      {/* 포스트 선택 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          1. 포스트 선택
        </h2>

        <input
          type="text"
          placeholder="제목 또는 카테고리로 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredPosts.map(post => (
            <button
              key={post.slug}
              onClick={() => setSelectedSlug(post.slug)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                selectedSlug === post.slug
                  ? 'bg-green-50 border border-green-200'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${CATEGORY_COLORS[post.category] || 'bg-slate-100 text-slate-600'}`}>
                {post.category}
              </span>
              <span className="font-medium text-slate-800 flex-1 truncate">{post.title}</span>
              <span className="text-xs text-slate-400">{post.date}</span>
            </button>
          ))}
        </div>

        {selectedPost && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-bold">선택됨:</span> {selectedPost.title}
              </p>
            </div>
            <button
              onClick={handleLoad}
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-lg transition-colors"
            >
              {loading ? '변환 중...' : '변환하기'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
        )}
      </div>

      {/* 결과 */}
      {result && (
        <div className="space-y-4">
          {/* 제목 복사 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">2. 제목 복사</h2>
              <button
                onClick={handleCopyTitle}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                  copied === 'title' ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copied === 'title' ? '복사됨!' : '제목 복사'}
              </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-lg font-bold text-slate-800">
              {result.title}
            </div>
          </div>

          {/* 본문 복사 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">3. 본문 복사</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyHtml}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                    copied === 'html' ? 'bg-green-100 text-green-700' : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {copied === 'html' ? '복사됨!' : 'HTML 복사 (추천)'}
                </button>
                <button
                  onClick={handleCopyText}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                    copied === 'text' ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {copied === 'text' ? '복사됨!' : '텍스트 복사'}
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: result.html }}
              />
            </div>
          </div>

          {/* 태그 복사 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">4. 태그 복사</h2>
              <button
                onClick={handleCopyTags}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                  copied === 'tags' ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {copied === 'tags' ? '복사됨!' : '태그 복사'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 사용법 안내 */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h2 className="text-sm font-bold text-green-800 mb-3">사용법</h2>
            <ol className="text-sm text-green-700 space-y-2">
              <li><b>1.</b> 위에서 제목, 본문, 태그를 각각 복사</li>
              <li><b>2.</b> 네이버 블로그 → 글쓰기</li>
              <li><b>3.</b> 제목 붙여넣기</li>
              <li><b>4.</b> 본문에 <b>HTML 복사</b>한 내용 붙여넣기 (서식 유지됨)</li>
              <li><b>5.</b> 태그란에 태그 붙여넣기</li>
              <li><b>6.</b> 발행!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
