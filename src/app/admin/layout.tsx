'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import type { User } from '@supabase/supabase-js';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
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
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
