'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                    Something went wrong
                </h2>
                <p className="text-slate-500 text-sm mb-8">
                    {error.message || '일시적인 오류가 발생했습니다. 다시 시도해주세요.'}
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </main>
    );
}
