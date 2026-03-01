'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Comment {
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    created_at: string;
}

type AuthMode = 'login' | 'signup' | null;

export default function Comments({ slug }: { slug: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentCount, setCommentCount] = useState(0);
    const [views, setViews] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    const fetchComments = useCallback(async () => {
        const { data, count } = await supabase
            .from('comments')
            .select('id, user_id, user_name, content, created_at', { count: 'exact' })
            .eq('slug', slug)
            .order('created_at', { ascending: false });
        if (data !== null) {
            setComments(data);
            setCommentCount(count ?? data.length);
        }
    }, [slug]);

    const fetchViews = useCallback(async () => {
        const { data } = await supabase.from('posts').select('views').eq('slug', slug).single();
        if (data) setViews(data.views ?? 0);
    }, [slug]);

    // Auth state
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        fetchComments();
        fetchViews();
    }, [fetchComments, fetchViews]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setAuthLoading(false);
        if (error) {
            setAuthError(
                error.message === 'Invalid login credentials'
                    ? '이메일 또는 비밀번호가 올바르지 않습니다.'
                    : error.message
            );
        } else {
            setAuthMode(null);
            setEmail('');
            setPassword('');
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName } },
        });
        setAuthLoading(false);
        if (error) {
            setAuthError(error.message);
        } else {
            setSignupSuccess(true);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;
        await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user?.id ?? '');
        fetchComments();
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;
        setPosting(true);
        const { error } = await supabase.from('comments').insert({
            slug,
            user_id: user.id,
            user_email: user.email ?? '',
            user_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
            content: newComment.trim(),
        });
        if (!error) {
            setNewComment('');
            await fetchComments();
        }
        setPosting(false);
    };

    const getUserDisplayName = (u: User) =>
        u.user_metadata?.display_name || u.email?.split('@')[0] || 'User';

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const closeAuthModal = () => {
        setAuthMode(null);
        setAuthError('');
        setSignupSuccess(false);
        setEmail('');
        setPassword('');
        setDisplayName('');
    };

    return (
        <section id="comments" className="mt-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-8">
                <div className="flex items-baseline gap-4">
                    <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                        Conversation
                    </h3>
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest pl-2 border-l border-slate-200">
                        {commentCount} Comments
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {views.toLocaleString()} Views
                    </div>
                    {user && (
                        <button
                            onClick={handleLogout}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                        >
                            Log Out
                        </button>
                    )}
                </div>
            </div>

            {/* Auth Modal */}
            {authMode && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeAuthModal();
                    }}
                >
                    <div className="bg-white border-2 border-slate-900 p-8 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                                {authMode === 'login' ? 'Log In' : 'Sign Up'}
                            </h4>
                            <button
                                onClick={closeAuthModal}
                                className="text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {signupSuccess ? (
                            <div className="text-center py-4">
                                <div className="text-4xl mb-3">✅</div>
                                <p className="text-slate-900 font-black text-lg mb-2">가입 완료!</p>
                                <p className="text-slate-500 text-sm mb-4">
                                    이메일을 확인하여 계정을 인증해주세요.
                                </p>
                                <button
                                    onClick={() => {
                                        setAuthMode('login');
                                        setSignupSuccess(false);
                                    }}
                                    className="w-full py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
                                >
                                    로그인으로 이동
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={authMode === 'login' ? handleLogin : handleSignup}
                                className="space-y-4"
                            >
                                {authMode === 'signup' && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                            닉네임 *
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            required
                                            className="w-full border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors"
                                            placeholder="표시될 이름"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                        이메일 *
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                        비밀번호 *
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors"
                                        placeholder="최소 6자"
                                    />
                                </div>
                                {authError && (
                                    <p className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 border border-red-100">
                                        {authError}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="w-full py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {authLoading
                                        ? '처리 중...'
                                        : authMode === 'login'
                                          ? 'Log In'
                                          : 'Sign Up'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                        setAuthError('');
                                        setSignupSuccess(false);
                                    }}
                                    className="w-full text-center text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors py-1"
                                >
                                    {authMode === 'login'
                                        ? '계정이 없으신가요? → 회원가입'
                                        : '이미 계정이 있으신가요? → 로그인'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Comment Form or Login Prompt */}
            <div className="bg-slate-50 p-6 border border-slate-200 mb-8">
                {!user ? (
                    <div className="sm:flex justify-between items-center gap-4">
                        <p className="text-slate-600 text-sm font-medium mb-4 sm:mb-0 max-w-xl leading-snug">
                            댓글을 남기려면 로그인이 필요합니다. 무료로 가입하세요!
                        </p>
                        <div className="flex gap-3 flex-shrink-0">
                            <button
                                onClick={() => setAuthMode('login')}
                                className="px-5 py-2.5 bg-white border border-slate-300 text-[10px] font-black uppercase tracking-widest hover:border-slate-900 transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setAuthMode('signup')}
                                className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handlePostComment}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                                {getUserDisplayName(user).charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                                {getUserDisplayName(user)}
                            </span>
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full h-24 p-4 border border-slate-200 focus:outline-none focus:border-slate-900 text-slate-900 font-medium placeholder:text-slate-400 resize-none bg-white text-sm transition-colors"
                            placeholder="What do you think?"
                            maxLength={1000}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-slate-400 font-medium">
                                {newComment.length}/1000
                            </span>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || posting}
                                className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {posting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Sort */}
            <div className="flex justify-start mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Sort by
                    <select className="bg-transparent border-none p-0 text-slate-900 font-black uppercase focus:ring-0 focus:outline-none cursor-pointer">
                        <option>Newest</option>
                        <option>Oldest</option>
                    </select>
                </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">
                        No comments yet. Start the conversation!
                    </p>
                </div>
            ) : (
                <div className="space-y-4 mb-12">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="border border-slate-100 p-6 bg-white hover:border-slate-200 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white text-[12px] font-black flex-shrink-0">
                                        {comment.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-slate-900">
                                            {comment.user_name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {formatDate(comment.created_at)}
                                        </p>
                                    </div>
                                </div>
                                {user?.id === comment.user_id && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-[10px] font-bold text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest flex-shrink-0"
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed pl-12">
                                {comment.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
