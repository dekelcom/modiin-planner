'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DayName, ScheduleState, Slot } from '@/lib/types';
import {
  CAL_END_H,
  CAL_START_H,
  findFreeSlot,
  firstDayWithData,
  hasOverlap,
  removeSlotAt,
  setSlotAt,
  toMin,
  toTimeStr,
  weekRangeLabel,
  withDayList,
  withHall,
} from '@/lib/scheduleLogic';
import HallCard, { type ActiveSlot } from './HallCard';

export default function AdminEditor({ initialData }: { initialData: ScheduleState }) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleState>(initialData);
  const [selectedDays, setSelectedDays] = useState<Record<string, DayName>>(() =>
    Object.fromEntries(initialData.halls.map((h) => [h.id, firstDayWithData(h)]))
  );
  const [activeByHall, setActiveByHall] = useState<Record<string, ActiveSlot | null>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  function getActive(hallId: string): ActiveSlot | null {
    return activeByHall[hallId] ?? null;
  }

  function cleanupHallActive(sched: ScheduleState, hallId: string): ScheduleState {
    const active = getActive(hallId);
    if (!active || !active.isNew) return sched;
    const hall = sched.halls.find((h) => h.id === hallId);
    const slot = hall?.days[active.day]?.[active.index];
    if (slot && !slot.title.trim()) {
      return withHall(sched, hallId, (h) => removeSlotAt(h, active.day, active.index));
    }
    return sched;
  }

  function addSlot(hallId: string, day: DayName) {
    const cleaned = cleanupHallActive(schedule, hallId);
    const hall = cleaned.halls.find((h) => h.id === hallId)!;
    const list = hall.days[day] ?? [];
    const start = findFreeSlot(list, CAL_START_H, CAL_END_H);
    const newSlot: Slot = { s: toTimeStr(start), e: toTimeStr(start + 60), sport: '🏀', title: '' };
    setSchedule(withHall(cleaned, hallId, (h) => withDayList(h, day, [...list, newSlot])));
    setActiveByHall((prev) => ({ ...prev, [hallId]: { day, index: list.length, isNew: true, original: null } }));
    setDirty(true);
  }

  function createSlotFromGrid(hallId: string, day: DayName, startMin: number, endMin: number) {
    const cleaned = cleanupHallActive(schedule, hallId);
    const hall = cleaned.halls.find((h) => h.id === hallId)!;
    const list = hall.days[day] ?? [];
    if (hasOverlap(list, startMin, endMin)) {
      setSchedule(cleaned);
      return;
    }
    const newSlot: Slot = { s: toTimeStr(startMin), e: toTimeStr(endMin), sport: '🏀', title: '' };
    setSchedule(withHall(cleaned, hallId, (h) => withDayList(h, day, [...list, newSlot])));
    setActiveByHall((prev) => ({ ...prev, [hallId]: { day, index: list.length, isNew: true, original: null } }));
    setDirty(true);
  }

  function selectSlot(hallId: string, day: DayName, index: number) {
    const cleaned = cleanupHallActive(schedule, hallId);
    setSchedule(cleaned);
    const hall = cleaned.halls.find((h) => h.id === hallId)!;
    const slot = (hall.days[day] ?? [])[index];
    if (!slot) return;
    setActiveByHall((prev) => ({ ...prev, [hallId]: { day, index, isNew: false, original: { ...slot } } }));
  }

  function selectDay(hallId: string, day: DayName) {
    const cleaned = cleanupHallActive(schedule, hallId);
    setSchedule(cleaned);
    setActiveByHall((prev) => ({ ...prev, [hallId]: null }));
    setSelectedDays((prev) => ({ ...prev, [hallId]: day }));
  }

  function cancelActive(hallId: string) {
    const active = getActive(hallId);
    if (!active) return;
    if (active.isNew) {
      setSchedule(withHall(schedule, hallId, (h) => removeSlotAt(h, active.day, active.index)));
    } else if (active.original) {
      setSchedule(withHall(schedule, hallId, (h) => setSlotAt(h, active.day, active.index, active.original!)));
    }
    setActiveByHall((prev) => ({ ...prev, [hallId]: null }));
  }

  function deleteSlot(hallId: string, day: DayName, index: number) {
    // Any deletion in this day can shift the array indices of sibling slots,
    // so drop the active pointer whenever it points into the same day rather
    // than trying to track index shifts.
    setSchedule(withHall(schedule, hallId, (h) => removeSlotAt(h, day, index)));
    setActiveByHall((prev) => (prev[hallId]?.day === day ? { ...prev, [hallId]: null } : prev));
    setDirty(true);
  }

  function doneActive(hallId: string) {
    setSchedule(cleanupHallActive(schedule, hallId));
    setActiveByHall((prev) => ({ ...prev, [hallId]: null }));
  }

  function updateActiveSlot(hallId: string, patch: Partial<Slot>) {
    const active = getActive(hallId);
    if (!active) return;
    setSchedule(withHall(schedule, hallId, (h) => {
      const list = h.days[active.day] ?? [];
      const slot = list[active.index];
      if (!slot) return h;
      return setSlotAt(h, active.day, active.index, { ...slot, ...patch });
    }));
    setDirty(true);
  }

  function commitTime(hallId: string, field: 's' | 'e', raw: string): string | null {
    const active = getActive(hallId);
    if (!active) return null;
    const hall = schedule.halls.find((h) => h.id === hallId)!;
    const list = hall.days[active.day] ?? [];
    const slot = list[active.index];
    const val = raw.trim();
    const candS = field === 's' ? toMin(val) : toMin(slot.s);
    const candE = field === 'e' ? toMin(val) : toMin(slot.e);
    if (Number.isNaN(toMin(val))) return 'פורמט שעה לא תקין (לדוגמה 18:30)';
    if (Number.isNaN(candS) || Number.isNaN(candE) || candS >= candE) return 'שעת ההתחלה חייבת להיות לפני שעת הסיום';
    const others = list.filter((_, i) => i !== active.index);
    if (hasOverlap(others, candS, candE)) return 'יש כבר פעילות אחרת בשעה הזו באולם הזה';
    updateActiveSlot(hallId, { [field]: val } as Partial<Slot>);
    return null;
  }

  function toggleClosed(hallId: string) {
    setSchedule(withHall(schedule, hallId, (h) => ({ ...h, closed: !h.closed })));
    setDirty(true);
  }

  function toggleDayClosed(hallId: string, day: DayName) {
    setSchedule(withHall(schedule, hallId, (h) => {
      const next = { ...h.dayClosures };
      if (next[day] !== undefined) delete next[day];
      else next[day] = '';
      return { ...h, dayClosures: next };
    }));
    setActiveByHall((prev) => (prev[hallId]?.day === day ? { ...prev, [hallId]: null } : prev));
    setDirty(true);
  }

  function setClosedNote(hallId: string, value: string) {
    setSchedule(withHall(schedule, hallId, (h) => ({ ...h, closedNote: value })));
    setDirty(true);
  }

  function setDayClosureNote(hallId: string, day: DayName, value: string) {
    setSchedule(withHall(schedule, hallId, (h) => ({ ...h, dayClosures: { ...h.dayClosures, [day]: value } })));
    setDirty(true);
  }

  function setAnnouncement(hallId: string, value: string) {
    setSchedule(withHall(schedule, hallId, (h) => ({ ...h, announcement: value })));
    setDirty(true);
  }

  function setWeekStart(value: string) {
    setSchedule((prev) => ({ ...prev, weekStart: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'שמירה נכשלה');
      }
      setDirty(false);
      setSaveMsg('נשמר ✓');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (err) {
      setSaveMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const range = weekRangeLabel(schedule.weekStart);

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <h1 className="app-title">🛠 מסך העדכון</h1>
          <p className="app-sub">עדכנו את הלו״ז ולחצו &quot;שמירה ופרסום&quot; כדי לפרסם אותו.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a className="link-btn" href="/" target="_blank" rel="noreferrer">
            📣 הלוח המפורסם
          </a>
          <button className="link-btn" type="button" onClick={handleLogout}>
            יציאה
          </button>
        </div>
      </div>

      <div className="week-row">
        <div>
          <label htmlFor="weekStart">בחר תאריך התחלה לשבוע הקרוב</label>
          <input
            id="weekStart"
            type="date"
            value={schedule.weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </div>
        <div className="hint">
          השבוע יפורסם למשך 7 ימים, ממוצ״ש ועד יום שישי: <b dir="ltr">{range}</b>
        </div>
      </div>

      {schedule.halls.map((hall) => (
        <HallCard
          key={hall.id}
          hall={hall}
          weekStart={schedule.weekStart}
          selectedDay={selectedDays[hall.id]}
          active={getActive(hall.id)}
          onSelectDay={(day) => selectDay(hall.id, day)}
          onToggleClosed={() => toggleClosed(hall.id)}
          onClosedNoteChange={(v) => setClosedNote(hall.id, v)}
          onAnnouncementChange={(v) => setAnnouncement(hall.id, v)}
          onToggleDayClosed={() => toggleDayClosed(hall.id, selectedDays[hall.id])}
          onDayClosureNoteChange={(v) => setDayClosureNote(hall.id, selectedDays[hall.id], v)}
          onAddSlot={() => addSlot(hall.id, selectedDays[hall.id])}
          onSelectSlot={(index) => selectSlot(hall.id, selectedDays[hall.id], index)}
          onDeleteSlot={(index) => deleteSlot(hall.id, selectedDays[hall.id], index)}
          onCreateSlot={(startMin, endMin) => createSlotFromGrid(hall.id, selectedDays[hall.id], startMin, endMin)}
          onCommitTime={(field, value) => commitTime(hall.id, field, value)}
          onSport={() => {
            const active = getActive(hall.id);
            if (!active) return;
            const slot = (hall.days[active.day] ?? [])[active.index];
            if (!slot) return;
            updateActiveSlot(hall.id, { sport: slot.sport === '🏀' ? '🏐' : '🏀' });
          }}
          onTitle={(value) => updateActiveSlot(hall.id, { title: value })}
          onCancel={() => cancelActive(hall.id)}
          onDone={() => doneActive(hall.id)}
        />
      ))}

      <div className="save-bar">
        <span className={`save-status${saveMsg && saveMsg !== 'נשמר ✓' ? ' err' : ''}`}>
          {saveMsg || (dirty ? 'יש שינויים שלא נשמרו' : 'הכל שמור')}
        </span>
        <button className="save-btn" type="button" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? 'שומר…' : '💾 שמירה ופרסום'}
        </button>
      </div>
    </div>
  );
}
