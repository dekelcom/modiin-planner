import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getSchedule } from '@/lib/db';
import type { ScheduleState } from '@/lib/types';
import AdminEditor from '@/components/admin/AdminEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect('/login');

  let data: ScheduleState | null = null;
  let errorMessage: string | null = null;
  try {
    data = await getSchedule();
  } catch (err) {
    errorMessage = (err as Error).message;
  }

  if (!data) {
    return (
      <div className="page">
        <h1 className="app-title">⚠️ נדרשת השלמת הגדרה</h1>
        <p className="app-sub">{errorMessage}</p>
      </div>
    );
  }

  return <AdminEditor initialData={data} />;
}
