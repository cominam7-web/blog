'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Comment {
    id: string;
    user_id: string | null;
    user_name: string;
    content: string;
    created_at: string;
    is_guest: boolean;
}

export default function Comments({ slug }: { slug: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentCount, setCommentCount] = useState(0);
    const [views, setViews] = useState(0);

    // 댓글 작성 폼
    const [newComment, setNewComment] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPassword, setGuestPassword] = useState('');
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState('');

    // 삭제 모달
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    // 소셜 로그인 로딩
    const [socialLoading, setSocialLoading] = useState<string | null>(null);

    // 정렬
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    // 허니팟 (스팸 방지)
    const [hp, setHp] = useState('');

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
            const data = await res.json();
            if (data.comments) {
                setComments(data.comments);
                setCommentCount(data.count ?? data.comments.length);
            }
        } catch { /* ignore */ }
    }, [slug]);

    const fetchViews = useCallback(async () => {
        const { data } = await getSupabase().from('posts').select('views').eq('slug', slug).single();
        if (data) setViews(data.views ?? 0);
    }, [slug]);

    // Auth state
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
        fetchComments();
        fetchViews();
    }, [fetchComments, fetchViews]);

    // localStorage에서 게스트 닉네임 복원
    useEffect(() => {
        const saved = localStorage.getItem('blog-guest-name');
        if (saved) setGuestName(saved);
    }, []);

    // ─── 소셜 로그인 ───
    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        setSocialLoading(provider);
        const { error } = await getSupabase().auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/blog/${slug}#comments`,
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

    // ─── 댓글 작성 ───
    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setPosting(true);
        setPostError('');

        try {
            const payload: Record<string, string> = {
                slug,
                content: newComment.trim(),
            };

            if (hp) payload._hp = hp; // 허니팟

            if (user) {
                // 로그인 사용자
                const { data } = await getSupabase().auth.getSession();
                payload.accessToken = data.session?.access_token || '';
            } else {
                // 게스트
                if (!guestName.trim()) {
                    setPostError('닉네임을 입력해주세요.');
                    setPosting(false);
                    return;
                }
                payload.guestName = guestName.trim();
                if (guestPassword) payload.guestPassword = guestPassword;
                // 닉네임 저장
                localStorage.setItem('blog-guest-name', guestName.trim());
            }

            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setPostError(data.error || '댓글 등록에 실패했습니다.');
            } else {
                setNewComment('');
                setGuestPassword('');
                await fetchComments();
            }
        } catch {
            setPostError('네트워크 오류가 발생했습니다.');
        } finally {
            setPosting(false);
        }
    };

    // ─── 댓글 삭제 ───
    const handleDeleteComment = async (commentId: string, isGuest: boolean) => {
        if (isGuest) {
            // 게스트 댓글: 비밀번호 모달 표시
            setDeleteTarget(commentId);
            setDeletePassword('');
            setDeleteError('');
            return;
        }

        // 로그인 사용자 댓글: 바로 삭제
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        const { data } = await getSupabase().auth.getSession();
        const token = data.session?.access_token || '';

        const res = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            await fetchComments();
        }
    };

    const handleGuestDelete = async () => {
        if (!deleteTarget || !deletePassword) return;
        setDeleting(true);
        setDeleteError('');

        try {
            const res = await fetch(`/api/comments/${deleteTarget}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                setDeleteError(data.error || '삭제에 실패했습니다.');
            } else {
                setDeleteTarget(null);
                await fetchComments();
            }
        } catch {
            setDeleteError('네트워크 오류가 발생했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    // ─── 유틸 ───
    const getUserDisplayName = (u: User) =>
        u.user_metadata?.display_name
        || u.user_metadata?.full_name
        || u.user_metadata?.name
        || u.email?.split('@')[0]
        || 'User';

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'short', day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const canDelete = (comment: Comment) => {
        if (comment.is_guest) return true; // 비밀번호로 삭제
        if (user?.id === comment.user_id) return true; // 본인 댓글
        if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) return true; // 관리자
        return false;
    };

    return (
        <section id="comments" className="mt-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-2 mb-8 gap-2">
                <div className="flex items-baseline gap-2 sm:gap-4">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 uppercase">
                        댓글
                    </h3>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-2 border-l border-slate-200">
                        {commentCount} 개
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    {user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {views.toLocaleString()} Views
                        </div>
                    )}
                    {user && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500">
                                {getUserDisplayName(user)}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comment Form */}
            <div className="bg-slate-50 p-6 border border-slate-200 mb-8">
                <form onSubmit={handlePostComment}>
                    {/* 로그인 사용자 표시 */}
                    {user && (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                                {getUserDisplayName(user).charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                {getUserDisplayName(user)}
                            </span>
                        </div>
                    )}

                    {/* 게스트 입력 필드 */}
                    {!user && (
                        <div className="flex flex-col sm:flex-row gap-3 mb-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="닉네임 *"
                                    maxLength={30}
                                    className="w-full border border-slate-200 px-3 py-2 text-sm font-medium focus:outline-none focus:border-slate-900 bg-white transition-colors"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="password"
                                    value={guestPassword}
                                    onChange={(e) => setGuestPassword(e.target.value)}
                                    placeholder="삭제 비밀번호 (선택)"
                                    maxLength={30}
                                    className="w-full border border-slate-200 px-3 py-2 text-sm font-medium focus:outline-none focus:border-slate-900 bg-white transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* 허니팟 (숨김 필드 - 봇 방지) */}
                    <input
                        type="text"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="absolute opacity-0 pointer-events-none h-0 w-0"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                    />

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full h-24 p-4 border border-slate-200 focus:outline-none focus:border-slate-900 text-slate-900 font-medium placeholder:text-slate-400 resize-none bg-white text-sm transition-colors"
                        placeholder="댓글을 남겨주세요..."
                        maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-400 font-medium">
                            {newComment.length}/1000
                        </span>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || posting}
                            className="px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {posting ? '등록 중...' : '등록'}
                        </button>
                    </div>

                    {postError && (
                        <p className="mt-2 text-red-500 text-sm font-medium bg-red-50 px-3 py-2 border border-red-100">
                            {postError}
                        </p>
                    )}
                </form>

                {/* 소셜 로그인 */}
                {!user && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                            소셜 로그인
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                disabled={socialLoading !== null}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-400 transition-colors disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {socialLoading === 'google' ? '연결 중...' : 'Google'}
                            </button>
                            <button
                                onClick={() => handleSocialLogin('kakao')}
                                disabled={socialLoading !== null}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-[#FEE500] text-sm font-medium text-[#191919] hover:bg-[#FDD835] transition-colors disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#191919" d="M12 3C6.48 3 2 6.44 2 10.64c0 2.73 1.82 5.12 4.55 6.47-.2.74-.73 2.68-.84 3.1-.13.52.19.51.4.37.17-.11 2.62-1.78 3.68-2.5.7.1 1.43.16 2.21.16 5.52 0 10-3.44 10-7.64S17.52 3 12 3z" />
                                </svg>
                                {socialLoading === 'kakao' ? '연결 중...' : 'Kakao'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 게스트 비밀번호 삭제 모달 */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
                >
                    <div className="bg-white border-2 border-slate-900 p-6 w-full max-w-sm">
                        <h4 className="text-lg font-black tracking-tighter text-slate-900 uppercase mb-4">
                            댓글 삭제
                        </h4>
                        <p className="text-sm text-slate-500 mb-4">
                            댓글 작성 시 입력한 비밀번호를 입력해주세요.
                        </p>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="삭제 비밀번호"
                            className="w-full border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900 mb-3"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleGuestDelete(); }}
                            autoFocus
                        />
                        {deleteError && (
                            <p className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 border border-red-100 mb-3">
                                {deleteError}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 border border-slate-300 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleGuestDelete}
                                disabled={!deletePassword || deleting}
                                className="flex-1 py-2.5 bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {deleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort */}
            <div className="flex justify-start mb-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    정렬
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="bg-transparent border-none p-0 text-slate-900 font-black uppercase focus:ring-0 focus:outline-none cursor-pointer"
                    >
                        <option value="newest">최신순</option>
                        <option value="oldest">오래된순</option>
                    </select>
                </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">
                        아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                    </p>
                </div>
            ) : (
                <div className="space-y-4 mb-12">
                    {(sortOrder === 'oldest' ? [...comments].reverse() : comments).map((comment) => (
                        <div
                            key={comment.id}
                            className="border border-slate-100 p-6 bg-white hover:border-slate-200 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 ${comment.is_guest ? 'bg-slate-400' : 'bg-slate-900'}`}>
                                        {comment.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-900">
                                                {comment.user_name}
                                            </p>
                                            {comment.is_guest && (
                                                <span className="text-xs font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase">
                                                    게스트
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {formatDate(comment.created_at)}
                                        </p>
                                    </div>
                                </div>
                                {canDelete(comment) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id, comment.is_guest)}
                                        className="text-xs font-bold text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest flex-shrink-0 px-2 py-1"
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
