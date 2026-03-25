'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'cookie-consent';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem(CONSENT_KEY, 'declined');
        setVisible(false);
        // GA/AdSense 쿠키 비활성화
        if (typeof window !== 'undefined') {
            (window as any)['ga-disable-G-JSBSZH7QEG'] = true;
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
            <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-6">
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                    이 사이트는 Google Analytics와 Google AdSense를 위해 쿠키를 사용합니다.
                    쿠키 사용에 동의하시면 맞춤 광고와 사이트 분석이 활성화됩니다.{' '}
                    <a href="/privacy" className="text-blue-600 underline hover:text-blue-800">
                        개인정보처리방침
                    </a>
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={accept}
                        className="flex-1 bg-slate-900 text-white text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        동의
                    </button>
                    <button
                        onClick={decline}
                        className="flex-1 bg-slate-100 text-slate-600 text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        거부
                    </button>
                </div>
            </div>
        </div>
    );
}
