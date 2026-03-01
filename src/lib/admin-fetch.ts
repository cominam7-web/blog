import { getSupabase } from './supabase';

export async function adminFetch(url: string, options?: RequestInit): Promise<Response> {
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token || '';

    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options?.headers,
        },
    });
}
