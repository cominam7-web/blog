'use client';

import { useState } from 'react';

const PAGE_SIZE = 10;

export default function PaginatedList({ children }: { children: React.ReactNode[] }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(children.length / PAGE_SIZE);
    const paged = children.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <>
            <div className="grid grid-cols-1 gap-12">
                {paged}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ← 이전
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={`w-9 h-9 text-sm font-bold rounded-lg transition-colors ${
                                p === page
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        다음 →
                    </button>
                </div>
            )}
        </>
    );
}
