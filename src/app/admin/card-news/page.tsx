'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

interface PostItem {
  slug: string;
  title: string;
  category: string;
  date: string;
}

interface SlideImage {
  index: number;
  url: string;
  type: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Hacks: 'bg-blue-100 text-blue-700',
  Health: 'bg-green-100 text-green-700',
  Tech: 'bg-purple-100 text-purple-700',
  Entertainment: 'bg-rose-100 text-rose-700',
};

export default function CardNewsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [pointCount, setPointCount] = useState(4);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<SlideImage[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState('');

  useEffect(() => {
    adminFetch('/api/card-news')
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => setError('포스트 목록을 불러오지 못했습니다.'));
  }, []);

  const selectedPost = posts.find(p => p.slug === selectedSlug);

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  async function handleGenerate() {
    if (!selectedSlug) return;
    setGenerating(true);
    setImages([]);
    setError('');

    try {
      const res = await adminFetch('/api/card-news', {
        method: 'POST',
        body: JSON.stringify({ slug: selectedSlug, pointCount }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setImages(data.images || []);
    } catch (e: any) {
      setError(e.message || '카드뉴스 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublishInstagram() {
    if (!selectedSlug || images.length < 2) return;
    setPublishing(true);
    setPublishResult('');
    setError('');

    try {
      const res = await adminFetch('/api/card-news', {
        method: 'POST',
        body: JSON.stringify({ slug: selectedSlug, pointCount, publishToInstagram: true }),
      });
      const data = await res.json();

      if (data.instagramPostId) {
        setPublishResult('Instagram에 게시 완료!');
        setImages(data.images || []);
      } else if (data.instagramError) {
        setError(`Instagram 게시 실패: ${data.instagramError}`);
      } else {
        setError('Instagram 게시에 실패했습니다.');
      }
    } catch (e: any) {
      setError(e.message || 'Instagram 게시에 실패했습니다.');
    } finally {
      setPublishing(false);
    }
  }

  async function handleDownloadAll() {
    for (const img of images) {
      const res = await fetch(img.url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `card-news-${selectedSlug}-${img.index}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }

  async function handleDownloadSingle(img: SlideImage) {
    const res = await fetch(img.url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `card-news-${selectedSlug}-${img.index}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 mb-6">카드뉴스 생성</h1>

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
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredPosts.map(post => (
            <button
              key={post.slug}
              onClick={() => setSelectedSlug(post.slug)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                selectedSlug === post.slug
                  ? 'bg-blue-50 border border-blue-200'
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
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-bold">선택됨:</span> {selectedPost.title}
            </p>
          </div>
        )}
      </div>

      {/* 옵션 + 생성 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          2. 옵션 설정 & 생성
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              핵심 포인트 수
            </label>
            <select
              value={pointCount}
              onChange={e => setPointCount(Number(e.target.value))}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3장 (총 5슬라이드)</option>
              <option value={4}>4장 (총 6슬라이드)</option>
              <option value={5}>5장 (총 7슬라이드)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedSlug || generating}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                생성 중... (30초~1분)
              </>
            ) : (
              '카드뉴스 생성'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* 결과 미리보기 */}
      {images.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              3. 결과 미리보기
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePublishInstagram}
                disabled={publishing || images.length < 2}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-300 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                {publishing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    게시 중...
                  </>
                ) : 'Instagram 게시'}
              </button>
              <button
                onClick={handleDownloadAll}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-colors"
              >
                전체 다운로드
              </button>
            </div>
          </div>

          {publishResult && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg font-semibold">
              {publishResult}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map(img => (
              <div key={img.index} className="relative group">
                <div
                  className="aspect-[4/5] rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setPreviewIdx(img.index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`슬라이드 ${img.index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {img.index}장 · {img.type === 'cover' ? '표지' : img.type === 'cta' ? 'CTA' : '본문'}
                  </span>
                  <button
                    onClick={() => handleDownloadSingle(img)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    다운로드
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 풀스크린 미리보기 */}
      {previewIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-slate-300"
            onClick={() => setPreviewIdx(null)}
          >
            ✕
          </button>

          {/* 이전/다음 */}
          {previewIdx > 1 && (
            <button
              className="absolute left-4 text-white text-4xl hover:text-slate-300"
              onClick={e => { e.stopPropagation(); setPreviewIdx(previewIdx - 1); }}
            >
              ‹
            </button>
          )}
          {previewIdx < images.length && (
            <button
              className="absolute right-16 text-white text-4xl hover:text-slate-300"
              onClick={e => { e.stopPropagation(); setPreviewIdx(previewIdx + 1); }}
            >
              ›
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.find(i => i.index === previewIdx)?.url}
            alt={`슬라이드 ${previewIdx}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
