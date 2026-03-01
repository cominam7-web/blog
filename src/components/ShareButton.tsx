'use client';

import { useState } from 'react';

export default function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const input = document.createElement('input');
            input.value = window.location.href;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="relative ml-4">
            <button
                onClick={handleCopyLink}
                className="p-1 hover:bg-slate-50 rounded-full transition-colors"
                title="링크 복사"
            >
                <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>
            {copied && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded whitespace-nowrap">
                    링크 복사됨!
                </span>
            )}
        </div>
    );
}
