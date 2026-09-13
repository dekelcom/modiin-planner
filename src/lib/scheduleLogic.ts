import type { DayName, Hall, ScheduleState, Slot } from './types';
import { DAY_ORDER } from './types';

export function toMin(t: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec((t || '').trim());
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function toTimeStr(minRaw: number): string {
  const min = Math.max(0, Math.min(23 * 60 + 59, Math.round(minRaw)));
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function fmtDM(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}`;
}

const DAY_OFFSET: Record<DayName, number> = {
  'מוצ״ש': 0,
  'ראשון': 1,
  'שני': 2,
  'שלישי': 3,
  'רביעי': 4,
  'חמישי': 5,
  'שישי': 6,
};

export function dateForDay(weekStart: string, day: DayName): Date {
  const start = new Date(`${weekStart}T00:00:00`);
  start.setDate(start.getDate() + DAY_OFFSET[day]);
  return start;
}

export function weekRangeLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${fmtDM(start)}–${fmtDM(end)}`;
}

export function hasOverlap(list: Slot[], candS: number, candE: number, exclude?: Slot): boolean {
  return list.some((s) => s !== exclude && candS < toMin(s.e) && toMin(s.s) < candE);
}

export function findFreeSlot(list: Slot[], startHour: number, endHour: number): number {
  let start = startHour * 60;
  while (start + 60 <= endHour * 60) {
    if (!hasOverlap(list, start, start + 60)) return start;
    start += 30;
  }
  return startHour * 60;
}

export function dayCellDays(hall: Hall): DayName[] {
  return DAY_ORDER.filter((d) => (hall.days[d]?.length ?? 0) > 0 || hall.dayClosures[d] !== undefined);
}

export function hallNameLine(halls: Hall[]): string {
  const names = halls.map((h) => h.name);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`;
}

export function announcementLines(halls: Hall[]): string[] {
  return halls
    .filter((h) => h.announcement && h.announcement.trim())
    .map((h) => `אולם ${h.name} - ${h.announcement.trim()}`);
}

export function buildWaText(state: ScheduleState): string {
  const range = weekRangeLabel(state.weekStart);
  const nameLine = hallNameLine(state.halls);
  // Wrap HH:MM–HH:MM ranges in Unicode isolate marks so the numbers keep
  // their chronological order once this text lands in a right-to-left
  // context (our own preview, and WhatsApp on the recipient's phone).
  const iso = (r: string) => `⁦${r}⁩`;
  let out = `📋 לוח פעילות אולמות – ${nameLine} | ${iso(range)}\n\n`;
  state.halls.forEach((hall) => {
    out += `🏟️ אולם ${hall.name}\n\n`;
    if (hall.closed) {
      hall.closedNote
        .split('\n')
        .filter(Boolean)
        .forEach((line) => {
          out += `${line}\n\n`;
        });
    } else {
      const days = dayCellDays(hall);
      days.forEach((day) => {
        out += `יום ${day}\n`;
        if (hall.dayClosures[day] !== undefined) {
          out += `🔒 ${hall.dayClosures[day] || 'האולם סגור ביום זה'}\n`;
        } else {
          (hall.days[day] ?? []).forEach((slot) => {
            out += `• ${iso(`${slot.s}–${slot.e}`)} – ${slot.sport} ${slot.title || '(ללא שם)'}\n`;
          });
        }
        out += `\n`;
      });
    }
  });
  const announcements = announcementLines(state.halls);
  if (announcements.length) {
    out += `${announcements.map((l) => `📌 ${l}`).join('\n')}\n\n`;
  }
  out += `נא להיערך בהתאם ולעדכן את המאמנים והקבוצות הרלוונטיות.`;
  return out;
}

export function posterDays(halls: Hall[]): DayName[] {
  const standardDays: DayName[] = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
  const hasMotzash = halls.some(
    (h) => !h.closed && ((h.days['מוצ״ש']?.length ?? 0) > 0 || h.dayClosures['מוצ״ש'] !== undefined)
  );
  return hasMotzash ? (['מוצ״ש', ...standardDays] as DayName[]) : standardDays;
}

export const CAL_START_H = 8;
export const CAL_END_H = 24;
export const HOUR_PX = 44;
export const PX_PER_MIN = HOUR_PX / 60;

export const HALL_COLORS: Record<string, string> = {
  beerot: '#2F6FBD',
  achisamech: '#2E8B57',
  nachshon: '#6C4AB6',
  kibbutz: '#B5762E',
};
export const POSTER_COLORS = ['#2F6FBD', '#2E8B57', '#6C4AB6', '#B5762E'];

export function hallColor(hall: Hall, index: number): string {
  return HALL_COLORS[hall.id] ?? POSTER_COLORS[index % POSTER_COLORS.length];
}

export function firstDayWithData(hall: Hall): DayName {
  return DAY_ORDER.find((d) => (hall.days[d]?.length ?? 0) > 0) ?? 'ראשון';
}

export function withHall(state: ScheduleState, hallId: string, fn: (h: Hall) => Hall): ScheduleState {
  return { ...state, halls: state.halls.map((h) => (h.id === hallId ? fn(h) : h)) };
}

export function withDayList(hall: Hall, day: DayName, list: Slot[]): Hall {
  return { ...hall, days: { ...hall.days, [day]: list } };
}

export function setSlotAt(hall: Hall, day: DayName, index: number, slot: Slot): Hall {
  return withDayList(hall, day, (hall.days[day] ?? []).map((s, i) => (i === index ? slot : s)));
}

export function removeSlotAt(hall: Hall, day: DayName, index: number): Hall {
  return withDayList(hall, day, (hall.days[day] ?? []).filter((_, i) => i !== index));
}
