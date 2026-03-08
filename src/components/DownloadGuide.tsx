'use client';

import { useState, FormEvent } from 'react';

interface DownloadGuideProps {
    guideSlug: string;
    title: string;
    description: string;
    className?: string;
}

export default function DownloadGuide({ guideSlug, title, description, className = '' }: DownloadGuideProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/download-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), guideSlug }),
            });
            const data = await res.json();

            if (res.ok && data.downloadUrl) {
                setStatus('success');
                setMessage(data.message);
                setEmail('');

                // Trigger file download
                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.download = '';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setStatus('error');
                setMessage(data.error || '오류가 발생했습니다.');
            }
        } catch {
            setStatus('error');
            setMessage('네트워크 오류가 발생했습니다.');
        }
    };

    return (
        <div className={`relative overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 rounded-sm p-6 sm:p-8 ${className}`}>
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />

            <div className="flex flex-col sm:flex-row gap-6">
                {/* Icon / visual */}
                <div className="flex-shrink-0 flex items-start justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-sm flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="inline-block px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm mb-3">
                        무료 PDF 가이드
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5">
                        {description}
                    </p>

                    {status === 'success' ? (
                        <div className="bg-green-50 border border-green-200 rounded-sm p-4">
                            <p className="text-sm font-bold text-green-700 mb-1">{message}</p>
                            <p className="text-xs text-green-600">
                                다운로드가 자동으로 시작됩니다. 시작되지 않으면 잠시 후 다시 시도해주세요.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                                placeholder="이메일을 입력하면 바로 다운로드!"
                                required
                                className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? (
                                    '처리 중...'
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        무료 다운로드
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                    {status === 'error' && <p className="text-xs text-red-500 mt-2">{message}</p>}
                    <p className="text-[10px] text-slate-400 mt-3">이메일은 뉴스레터 구독에 활용되며, 언제든 해지 가능합니다.</p>
                </div>
            </div>
        </div>
    );
}
