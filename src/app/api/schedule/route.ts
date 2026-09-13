import { NextResponse } from 'next/server';
import { getSchedule, saveSchedule } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import type { ScheduleState } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSchedule();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON לא תקין' }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as ScheduleState).weekStart !== 'string' ||
    !Array.isArray((body as ScheduleState).halls)
  ) {
    return NextResponse.json({ error: 'מבנה נתונים לא תקין' }, { status: 400 });
  }

  try {
    await saveSchedule(body as ScheduleState);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
