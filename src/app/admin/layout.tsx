import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
    title: 'Admin | Ilsanggam Life Studio',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        redirect('/');
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
