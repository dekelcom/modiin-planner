import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { ScheduleState } from './types';
import { defaultSchedule } from './defaultSchedule';

function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!url) {
    throw new Error(
      'לא נמצא חיבור למסד נתונים. יש להוסיף Postgres (Storage) בפרויקט ב-Vercel, או להגדיר DATABASE_URL מקומית — ראו README.'
    );
  }
  return url;
}

async function ensureTable(sql: NeonQueryFunction<false, false>) {
  await sql`
    CREATE TABLE IF NOT EXISTS schedule_state (
      id SMALLINT PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

export async function getSchedule(): Promise<ScheduleState> {
  const sql = neon(getConnectionString());
  await ensureTable(sql);
  const rows = await sql`SELECT data FROM schedule_state WHERE id = 1`;
  if (rows.length === 0) {
    await sql`
      INSERT INTO schedule_state (id, data)
      VALUES (1, ${JSON.stringify(defaultSchedule)}::jsonb)
    `;
    return defaultSchedule;
  }
  return rows[0].data as ScheduleState;
}

export async function saveSchedule(data: ScheduleState): Promise<void> {
  const sql = neon(getConnectionString());
  await ensureTable(sql);
  await sql`
    INSERT INTO schedule_state (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
  `;
}
