import { NextResponse } from 'next/server';
import { checkPin, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  let pin = '';
  try {
    const body = await request.json();
    pin = String(body?.pin ?? '');
  } catch {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  let ok = false;
  try {
    ok = checkPin(pin);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  if (!ok) {
    return NextResponse.json({ error: 'קוד שגוי' }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
