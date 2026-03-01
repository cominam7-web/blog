'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const CATEGORIES = ['Hacks', 'Tech', 'Entertainment', 'Health', 'Reviews', 'Deals', 'Best Picks'];

interface PostEditorProps {
    mode: 'create' | 'edit';
    initialData?: {
        slug: string;
        title: string;
        date: string;
        excerpt: string;
        category: string;
        tags: string[];
        imagePrompt: string;
        content: string;
    };
}

export default function PostEditor({ mode, initialData }: PostEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
    const [category, setCategory] = useState(initialData?.category || 'Hacks');
    const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
    const [imagePrompt, setImagePrompt] = useState(initialData?.imagePrompt || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const payload = {
                title: title.trim(),
                excerpt: excerpt.trim(),
                category,
                tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
                imagePrompt: imagePrompt.trim(),
                content: content.trim(),
                date: initialData?.date,
            };

            const url = mode === 'create'
                ? '/api/admin/posts'
                : `/api/admin/posts/${initialData!.slug}`;

            const res = await fetch(url, {
                method: mode === 'create' ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to save');
                return;
            }

            router.push('/admin/posts');
        } catch (err) {
            setError('Network error');
        } finally {
            setSaving(false);
        }
    };

    const insertNanobanana = () => {
        const tag = '[나노바나나: watercolor illustration of , no text, no letters, no writing]';
        setContent(prev => prev + '\n\n' + tag);
    };

    return (
        <div className="max-w-6xl">
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Metadata Fields */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Excerpt</label>
                        <input
                            type="text"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Short summary (150 chars)"
                            maxLength={200}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="tag1, tag2, tag3"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Image Prompt (Nanobanana)</label>
                        <input
                            type="text"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="English image description for AI generation, no text, no letters, no writing"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Editor / Preview Toggle */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setShowPreview(false)}
                            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${!showPreview ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Editor
                        </button>
                        <button
                            onClick={() => setShowPreview(true)}
                            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${showPreview ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Preview
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={insertNanobanana}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors px-2 py-1"
                            title="Insert Nanobanana image tag"
                        >
                            + Image Tag
                        </button>
                    </div>
                </div>

                {showPreview ? (
                    <div className="p-6 min-h-[500px] prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your post in Markdown..."
                        className="w-full min-h-[500px] p-6 text-sm font-mono text-slate-800 resize-y focus:outline-none border-none"
                        spellCheck={false}
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => router.push('/admin/posts')}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold py-2.5 px-8 rounded-lg transition-colors"
                >
                    {saving ? 'Saving...' : mode === 'create' ? 'Publish' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
