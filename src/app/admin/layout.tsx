'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import type { User } from '@supabase/supabase-js';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const sb = getSupabase();
        sb.auth.getUser().then(({ data }) => {
            const u = data.user;
            if (!u || u.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
                router.replace('/');
                return;
            }
            setUser(u);
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <p className="text-slate-400 text-sm">Loading...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 overflow-auto">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center md:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-600 hover:text-slate-900">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="ml-3 text-sm font-black text-slate-900 tracking-tight">Admin</span>
                </div>
                {children}
            </main>
        </div>
    );
}
