import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        if (!url || !key || !url.startsWith('http')) {
            console.warn('Supabase 환경 변수가 설정되지 않았습니다.');
            _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
        } else {
            _supabase = createClient(url, key);
        }
    }
    return _supabase;
}
