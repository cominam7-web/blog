'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

interface Inquiry {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    created_at: string;
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    const fetchInquiries = async () => {
        try {
            const res = await adminFetch('/api/admin/inquiries');
            if (res.ok) {
                setInquiries(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        await adminFetch('/api/admin/inquiries', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        });
        fetchInquiries();
    };

    const deleteInquiry = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await adminFetch('/api/admin/inquiries', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        fetchInquiries();
    };

    const openInquiry = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        if (inquiry.status === 'new') {
            updateStatus(inquiry.id, 'read');
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">New</span>;
            case 'read':
                return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase">Read</span>;
            case 'replied':
                return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Replied</span>;
            default:
                return null;
        }
    };

    const newCount = inquiries.filter(i => i.status === 'new').length;

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Inquiries</h1>
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inquiries</h1>
                    {newCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {newCount}
                        </span>
                    )}
                </div>
                <span className="text-slate-400 text-sm">{inquiries.length}개의 문의</span>
            </div>

            <div className="flex gap-6">
                {/* Inquiry List */}
                <div className="flex-1 space-y-2">
                    {inquiries.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <p className="text-lg font-medium">아직 문의가 없습니다</p>
                        </div>
                    ) : (
                        inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                onClick={() => openInquiry(inquiry)}
                                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                    selectedInquiry?.id === inquiry.id
                                        ? 'border-blue-500 shadow-md'
                                        : inquiry.status === 'new'
                                        ? 'border-red-200 bg-red-50/30'
                                        : 'border-slate-200'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {statusBadge(inquiry.status)}
                                            <span className="text-xs font-bold text-slate-700">{inquiry.name}</span>
                                            <span className="text-[10px] text-slate-400">{inquiry.email}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 truncate">{inquiry.subject}</p>
                                        <p className="text-xs text-slate-500 truncate mt-1">{inquiry.message}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(inquiry.created_at).toLocaleDateString('ko-KR', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteInquiry(inquiry.id); }}
                                            className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail Panel */}
                {selectedInquiry && (
                    <div className="w-96 bg-white border border-slate-200 rounded-lg p-6 sticky top-8 self-start">
                        <div className="flex items-center justify-between mb-4">
                            {statusBadge(selectedInquiry.status)}
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <h2 className="text-lg font-black text-slate-900 mb-2">{selectedInquiry.subject}</h2>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
                            <span className="font-bold text-slate-700">{selectedInquiry.name}</span>
                            <span>{selectedInquiry.email}</span>
                        </div>

                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">
                            {selectedInquiry.message}
                        </div>

                        <div className="text-[10px] text-slate-400 mb-4">
                            {new Date(selectedInquiry.created_at).toLocaleString('ko-KR')}
                        </div>

                        <div className="flex gap-2">
                            {selectedInquiry.status !== 'replied' && (
                                <button
                                    onClick={() => updateStatus(selectedInquiry.id, 'replied')}
                                    className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors"
                                >
                                    답변 완료 처리
                                </button>
                            )}
                            <a
                                href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                                className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors text-center"
                            >
                                이메일 답변
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
