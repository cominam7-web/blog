import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_supabase) {
            if (!supabaseUrl || !supabaseAnonKey) {
                console.warn('Supabase 환경 변수가 설정되지 않았습니다.');
                // 빌드 시점에는 더미 클라이언트 반환 (에러 방지)
                _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
            } else {
                _supabase = createClient(supabaseUrl, supabaseAnonKey);
            }
        }
        const value = (_supabase as any)[prop];
        return typeof value === 'function' ? value.bind(_supabase) : value;
    },
});
