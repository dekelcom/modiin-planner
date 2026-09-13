export type Sport = '🏀' | '🏐';

export interface Slot {
  s: string; // "HH:MM"
  e: string; // "HH:MM"
  sport: Sport;
  title: string;
}

export const DAY_ORDER = ['מוצ״ש', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'] as const;
export type DayName = (typeof DAY_ORDER)[number];

export interface Hall {
  id: string;
  name: string;
  icon: string;
  closed: boolean;
  closedNote: string;
  announcement: string;
  dayClosures: Partial<Record<DayName, string>>;
  days: Partial<Record<DayName, Slot[]>>;
}

export interface ScheduleState {
  weekStart: string; // ISO date "YYYY-MM-DD", a Saturday
  halls: Hall[];
}
