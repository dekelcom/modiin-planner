import PublicView from '@/components/PublicView';
import { getSchedule } from '@/lib/db';
import type { ScheduleState } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
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

  return <PublicView initialData={data} />;
}
