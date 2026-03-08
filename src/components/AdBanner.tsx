'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    responsive?: boolean;
    className?: string;
}

export default function AdBanner({ slot, format = 'auto', responsive = true, className = '' }: AdBannerProps) {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    useEffect(() => {
        if (!clientId || pushed.current) return;
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            pushed.current = true;
        } catch {
            // AdSense not loaded yet
        }
    }, [clientId]);

    if (!clientId) return null;

    return (
        <div className={`ad-container my-6 text-center ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            />
        </div>
    );
}
