import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
        }

        if (name.length > 100 || email.length > 200 || subject.length > 300 || message.length > 5000) {
            return NextResponse.json({ error: '입력 길이 제한을 초과했습니다.' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.from('inquiries').insert({
            name,
            email,
            subject,
            message,
            status: 'new',
        });

        if (error) {
            console.error('Inquiry insert error:', error);
            return NextResponse.json({ error: '문의 등록에 실패했습니다.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Contact API error:', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
