'use client';

import { useState, useEffect, useCallback } from 'react';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents() {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    // Extract headings from the DOM after render
    useEffect(() => {
        // Small delay to ensure markdown content has rendered
        const timer = setTimeout(() => {
            const article = document.querySelector('article');
            if (!article) return;

            const elements = article.querySelectorAll('h2, h3');
            const items: TocItem[] = [];

            elements.forEach((el) => {
                // Use existing id or generate one
                if (!el.id) {
                    const text = (el.textContent || '').trim();
                    el.id = text
                        .toLowerCase()
                        .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                }
                items.push({
                    id: el.id,
                    text: (el.textContent || '').trim(),
                    level: el.tagName === 'H2' ? 2 : 3,
                });
            });

            setHeadings(items);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    // Track active heading on scroll
    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // Find the first heading that is intersecting from top
                const visible = entries.filter((e) => e.isIntersecting);
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            {
                rootMargin: '-80px 0px -60% 0px',
                threshold: 0,
            }
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    const handleClick = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveId(id);
            setIsOpen(false);
        }
    }, []);

    if (headings.length < 2) return null;

    return (
        <nav className="my-8 border border-slate-200 rounded-sm bg-slate-50/80">
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-3 text-left"
            >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Table of Contents
                </span>
                <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Heading list */}
            {isOpen && (
                <ul className="px-5 pb-4 space-y-1">
                    {headings.map((h) => (
                        <li key={h.id}>
                            <button
                                onClick={() => handleClick(h.id)}
                                className={`block w-full text-left text-sm py-1 transition-colors duration-150 ${
                                    h.level === 3 ? 'pl-4' : 'pl-0'
                                } ${
                                    activeId === h.id
                                        ? 'text-blue-600 font-bold'
                                        : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                {h.text}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </nav>
    );
}
