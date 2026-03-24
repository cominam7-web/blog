import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { refreshTokenIfNeeded, saveTokenToDb } from '@/lib/instagram';

// GET: 토큰 상태 확인 + 자동 갱신
export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await refreshTokenIfNeeded();
  return NextResponse.json(result);
}

// POST: 현재 env 토큰을 DB에 초기 저장
export async function POST() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await saveTokenToDb();
    return NextResponse.json({ saved: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
