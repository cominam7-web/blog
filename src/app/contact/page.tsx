'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '문의 등록에 실패했습니다.');
            }

            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '문의 등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <main className="min-h-screen bg-white">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="text-5xl mb-6">✅</div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                        문의가 접수되었습니다
                    </h1>
                    <p className="text-slate-500 mb-8">
                        빠른 시일 내에 확인 후 답변드리겠습니다. 감사합니다.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-slate-900 text-white text-sm font-bold px-6 py-3 hover:bg-slate-700 transition-colors"
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-10 border-b-2 border-slate-900 pb-4">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 mb-2 uppercase">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span>&rarr;</span>
                        <span className="text-blue-600">Contact</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                        문의하기
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        궁금한 점이나 제안사항이 있으시면 아래 양식을 통해 문의해주세요.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                이름 *
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="홍길동"
                                className="w-full border border-slate-300 px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                이메일 *
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full border border-slate-300 px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            제목 *
                        </label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="문의 제목을 입력해주세요"
                            className="w-full border border-slate-300 px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            내용 *
                        </label>
                        <textarea
                            required
                            rows={8}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="문의 내용을 자세히 적어주세요"
                            className="w-full border border-slate-300 px-4 py-3 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors resize-vertical"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-3 border border-red-100">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? '접수 중...' : '문의 보내기'}
                    </button>
                </form>
            </div>
        </main>
    );
}
