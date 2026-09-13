import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB — a rendered poster JPEG is a few hundred KB

export async function POST(request: Request) {
  const token = process.env.IMAGES_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'לא נמצא חיבור לאחסון תמונות. יש להוסיף Blob storage בפרויקט ב-Vercel.' },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'לא התקבל קובץ תמונה' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'התמונה גדולה מדי' }, { status: 400 });
  }

  try {
    const blob = await put(`poster-${Date.now()}.jpg`, file, {
      access: 'public',
      contentType: 'image/jpeg',
      token,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
