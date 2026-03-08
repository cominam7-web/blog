'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const categories = [
    { name: 'LATEST', korean: '최신글', href: '/category/latest' },
    { name: 'HACKS', korean: '생활팁', href: '/category/hacks' },
    { name: 'TECH', korean: '기술', href: '/category/tech' },
    { name: 'ENTERTAINMENT', korean: '엔터테인먼트', href: '/category/entertainment' },
    { name: 'HEALTH', korean: '건강', href: '/category/health' },
    { name: 'REVIEWS', korean: '리뷰', href: '/category/reviews' },
    { name: 'DEALS', korean: '특가', href: '/category/deals' },
    { name: 'BEST PICKS', korean: '추천', href: '/category/best-picks' },
];

export default function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authDisplayName, setAuthDisplayName] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const mobileSearchRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Auth state listener
    useEffect(() => {
        const sb = getSupabase();
        sb.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            setTimeout(() => mobileSearchRef.current?.focus(), 300);
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => { document.body.style.overflow = ''; document.body.style.paddingRight = ''; };
    }, [isMobileMenuOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const getUserDisplayName = (u: User) =>
        u.user_metadata?.display_name || u.email?.split('@')[0] || 'User';

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        const sb = getSupabase();

        if (showAuthModal === 'login') {
            const { error } = await sb.auth.signInWithPassword({ email: authEmail, password: authPassword });
            if (error) {
                setAuthError(error.message === 'Invalid login credentials'
                    ? '이메일 또는 비밀번호가 올바르지 않습니다.'
                    : error.message === 'Email not confirmed'
                    ? '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
                    : error.message);
            } else {
                closeAuthModal();
            }
        } else {
            const { error } = await sb.auth.signUp({
                email: authEmail,
                password: authPassword,
                options: { data: { display_name: authDisplayName } },
            });
            if (error) {
                setAuthError(error.message);
            } else {
                setAuthError('');
                setShowAuthModal('login');
                setAuthEmail('');
                setAuthPassword('');
                setAuthDisplayName('');
                alert('가입 완료! 로그인해주세요.');
            }
        }
        setAuthLoading(false);
    };

    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        setSocialLoading(provider);
        const { error } = await getSupabase().auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin,
                ...(provider === 'kakao' && {
                    scopes: 'profile_nickname profile_image account_email',
                }),
            },
        });
        if (error) {
            setSocialLoading(null);
        }
    };

    const handleLogout = async () => {
        await getSupabase().auth.signOut();
    };

    const closeAuthModal = () => {
        setShowAuthModal(null);
        setAuthError('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthDisplayName('');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleMobileSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (mobileSearchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
            setIsMobileMenuOpen(false);
            setMobileSearchQuery('');
        }
    };

    // admin 페이지에서는 header 숨김
    if (pathname.startsWith('/admin')) return null;

    return (
        <>
        {/* Auth Modal - outside header to avoid backdrop-filter positioning issue */}
        {showAuthModal && (
            <div
                className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4"
                onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}
            >
                <div className="bg-white border-2 border-slate-900 p-8 w-full max-w-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                            {showAuthModal === 'login' ? 'Log In' : 'Sign Up'}
                        </h4>
                        <button onClick={closeAuthModal} className="text-slate-400 hover:text-slate-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        {showAuthModal === 'signup' && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">닉네임 *</label>
                                <input type="text" value={authDisplayName} onChange={(e) => setAuthDisplayName(e.target.value)} required
                                    className="w-full border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors" placeholder="표시될 이름" />
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">이메일 *</label>
                            <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required
                                className="w-full border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors" placeholder="email@example.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">비밀번호 *</label>
                            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required minLength={6}
                                className="w-full border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors" placeholder="최소 6자" />
                        </div>
                        {authError && (
                            <p className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 border border-red-100">{authError}</p>
                        )}
                        <button type="submit" disabled={authLoading}
                            className="w-full py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-50">
                            {authLoading ? '처리 중...' : showAuthModal === 'login' ? 'Log In' : 'Sign Up'}
                        </button>
                        <button type="button" onClick={() => {
                            setShowAuthModal(showAuthModal === 'login' ? 'signup' : 'login');
                            setAuthError('');
                        }} className="w-full text-center text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors py-1">
                            {showAuthModal === 'login' ? '계정이 없으신가요? → 회원가입' : '이미 계정이 있으신가요? → 로그인'}
                        </button>
                    </form>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3">소셜 로그인</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                disabled={!!socialLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-[11px] font-bold text-slate-700">
                                    {socialLoading === 'google' ? '연결 중...' : 'Google'}
                                </span>
                            </button>
                            <button
                                onClick={() => handleSocialLogin('kakao')}
                                disabled={!!socialLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-300 hover:bg-yellow-50 transition-colors disabled:opacity-50"
                                style={{ backgroundColor: socialLoading === 'kakao' ? undefined : '#FEE500' }}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000">
                                    <path d="M12 3c-5.52 0-10 3.13-10 7 0 2.48 1.64 4.66 4.12 5.91-.18.67-.67 2.42-.77 2.8-.12.47.17.46.36.34.15-.1 2.37-1.61 3.32-2.27.96.14 1.95.22 2.97.22 5.52 0 10-3.13 10-7s-4.48-7-10-7z" />
                                </svg>
                                <span className="text-[11px] font-bold text-slate-900">
                                    {socialLoading === 'kakao' ? '연결 중...' : 'Kakao'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Slide-in Menu Panel - outside header to avoid backdrop-filter issue */}
        {isMobileMenuOpen && (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-[90] bg-black/40 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                {/* Panel */}
                <div className="fixed top-0 right-0 bottom-0 z-[100] w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col">
                    {/* Close Button */}
                    <div className="flex items-center justify-end p-5">
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1 text-slate-900 hover:text-slate-500 transition-colors"
                            aria-label="메뉴 닫기"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-6 pb-6">
                        <form onSubmit={handleMobileSearch} className="flex items-center border-b-2 border-slate-300 pb-2">
                            <input
                                ref={mobileSearchRef}
                                type="text"
                                value={mobileSearchQuery}
                                onChange={(e) => setMobileSearchQuery(e.target.value)}
                                placeholder="Search ILSANGGAM"
                                className="flex-grow bg-transparent border-none text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
                            />
                            <button type="submit" className="text-slate-900 hover:text-slate-500 ml-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* Category List */}
                    <nav className="px-6">
                        <ul className="border-t border-dashed border-slate-300">
                            {categories.map((cat) => (
                                <li key={cat.name} className="border-b border-dashed border-slate-300">
                                    <Link
                                        href={cat.href}
                                        className="flex items-center justify-between py-4 hover:text-blue-600 transition-colors group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-black tracking-widest text-slate-900 uppercase group-hover:text-blue-600">
                                                {cat.name}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                {cat.korean}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Footer Links */}
                    <div className="mt-auto px-6 py-6 border-t border-slate-200">
                        <div className="flex items-center justify-center gap-6">
                            {[
                                { href: '/', label: 'Home' },
                                { href: '/about', label: 'About' },
                                { href: '/contact', label: 'Contact' },
                                { href: '/privacy', label: 'Privacy' },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-wider"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}

        <header className="bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 sticky top-0 z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto">
                {/* Desktop Search Overlay */}
                {isSearchOpen && (
                    <div className="absolute inset-0 bg-white z-[60] flex items-center px-4 sm:px-6 lg:px-8">
                        <form onSubmit={handleSearch} className="flex-grow flex items-center max-w-7xl mx-auto">
                            <svg className="w-6 h-6 text-slate-400 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search stories, tips, and hacks..."
                                className="flex-grow bg-transparent border-none text-xl sm:text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:ring-0 py-4 outline-none"
                            />
                            <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-4 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}

                {/* Top Section */}
                <div className="flex justify-between items-center pb-4 sm:pb-6">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="inline-block border-2 border-slate-900 px-2 sm:px-3 py-1 hover:bg-slate-900 hover:text-white transition-all duration-300 group flex-shrink-0"
                    >
                        {/* Mobile: two-line logo */}
                        <span className="block sm:hidden text-lg font-black tracking-tighter leading-tight uppercase">
                            Ilsanggam Life<br />Studio
                        </span>
                        {/* Desktop: single-line logo */}
                        <span className="hidden sm:block text-3xl font-black tracking-tighter leading-tight uppercase">
                            Ilsanggam Life Studio
                        </span>
                    </Link>

                    {/* Right Icons */}
                    <div className="flex items-center gap-3 sm:gap-6 text-slate-900 ml-4">
                        {/* Auth Buttons / User Info */}
                        {user ? (
                            <div className="flex items-center gap-2 text-[11px] font-bold">
                                {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                                    <Link href="/admin" className="text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
                                        Admin
                                    </Link>
                                )}
                                <span className="hidden sm:inline text-slate-700">
                                    {getUserDisplayName(user)}
                                </span>
                                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[11px] font-bold">
                                <button onClick={() => setShowAuthModal('login')} className="text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                                    로그인
                                </button>
                                <span className="text-slate-300">|</span>
                                <button onClick={() => setShowAuthModal('signup')} className="text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
                                    회원가입
                                </button>
                            </div>
                        )}

                        <div className="h-6 w-[1px] bg-slate-200"></div>

                        {/* Desktop Social Icons */}
                        <div className="hidden md:flex items-center gap-3">
                            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                            <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-7 h-7 border-2 border-slate-900 rounded-full flex items-center justify-center hover:bg-[#E4405F] hover:border-[#E4405F] hover:text-white transition-colors" aria-label="Instagram">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                            )}
                            {process.env.NEXT_PUBLIC_X_URL && (
                            <a href={process.env.NEXT_PUBLIC_X_URL} target="_blank" rel="noopener noreferrer" className="w-7 h-7 border-2 border-slate-900 rounded-full flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors" aria-label="X">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            )}
                            {process.env.NEXT_PUBLIC_FACEBOOK_URL && (
                            <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="w-7 h-7 border-2 border-slate-900 rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-colors" aria-label="Facebook">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            )}
                            {process.env.NEXT_PUBLIC_YOUTUBE_URL && (
                            <a href={process.env.NEXT_PUBLIC_YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="w-7 h-7 border-2 border-slate-900 rounded-full flex items-center justify-center hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-colors" aria-label="YouTube">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>
                            </a>
                            )}
                            <a href="http://pf.kakao.com/_aWxnZX" target="_blank" rel="noopener noreferrer" className="w-7 h-7 border-2 border-slate-900 rounded-full flex items-center justify-center hover:bg-[#FEE500] hover:border-[#FEE500] transition-colors" aria-label="카카오 채널">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.65 1.753 4.992 4.416 6.376l-1.128 4.147a.5.5 0 00.768.544l4.87-3.214c.357.031.718.047 1.074.047 5.523 0 10-3.463 10-7.9S17.523 3 12 3z" /></svg>
                            </a>
                        </div>
                        <div className="h-6 w-[2px] bg-slate-200 hidden md:block"></div>

                        {/* Search (desktop) */}
                        <button
                            className="p-1 hover:text-blue-600 transition-colors hidden sm:block"
                            aria-label="Search"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Search (mobile - opens menu) */}
                        <button
                            className="p-1 hover:text-blue-600 transition-colors sm:hidden"
                            aria-label="Search"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Hamburger */}
                        <button
                            className="p-1 hover:text-blue-600 transition-colors"
                            aria-label="Menu"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Sub-Navigation */}
                <div className="relative border-t border-b border-dashed border-slate-300 mb-2">
                    <nav className="py-1 overflow-x-auto no-scrollbar">
                        <ul className="flex items-center justify-center min-w-max">
                            {categories.map((cat) => (
                                <li key={cat.name}>
                                    <Link
                                        href={cat.href}
                                        className="text-[13px] sm:text-[15px] font-black tracking-widest text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center text-center px-4 sm:px-6 py-3 leading-tight whitespace-nowrap"
                                    >
                                        <span>{cat.name}</span>
                                        <span className="text-[10px] sm:text-[12px] font-medium text-slate-400 mt-0.5">
                                            {cat.korean}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {/* Scroll hint gradients - mobile only */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none sm:hidden" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
                </div>
            </div>
        </header>
      </>
    );
}
