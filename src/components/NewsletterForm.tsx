'use client';

import { useState, FormEvent } from 'react';

interface NewsletterFormProps {
    variant?: 'inline' | 'card';
    className?: string;
}

export default function NewsletterForm({ variant = 'card', className = '' }: NewsletterFormProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error);
            }
        } catch {
            setStatus('error');
            setMessage('네트워크 오류가 발생했습니다.');
        }
    };

    if (variant === 'inline') {
        return (
            <div className={`${className}`}>
                {status === 'success' ? (
                    <p className="text-sm font-medium text-green-600">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                            placeholder="이메일 주소"
                            required
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                            {status === 'loading' ? '...' : '구독'}
                        </button>
                    </form>
                )}
                {status === 'error' && <p className="text-xs text-red-500 mt-1">{message}</p>}
            </div>
        );
    }

    return (
        <div className={`bg-slate-50 border border-slate-200 rounded-sm p-6 ${className}`}>
            <div className="text-center mb-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    매주 쓸모 있는 정보, 받아보세요
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    건강, 절약, 테크 꿀팁을 이메일로 보내드립니다.
                </p>
            </div>

            {status === 'success' ? (
                <div className="text-center py-3">
                    <p className="text-sm font-medium text-green-600">{message}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                        placeholder="example@email.com"
                        required
                        className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                        {status === 'loading' ? '구독 중...' : '무료 구독하기'}
                    </button>
                </form>
            )}
            {status === 'error' && <p className="text-xs text-red-500 mt-2 text-center">{message}</p>}
            <p className="text-[10px] text-slate-400 text-center mt-3">스팸 없이, 언제든 구독 해지 가능합니다.</p>
        </div>
    );
}
