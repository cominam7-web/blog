import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function verifyAdmin(): Promise<{ authorized: boolean; userId?: string; email?: string }> {
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
        return { authorized: false };
    }

    return { authorized: true, userId: user.id, email: user.email };
}

export function getServiceSupabase() {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
