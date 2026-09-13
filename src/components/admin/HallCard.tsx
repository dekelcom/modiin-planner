'use client';

import type { DayName, Hall, Slot } from '@/lib/types';
import { DAY_ORDER } from '@/lib/types';
import SlotEditorPanel from './SlotEditorPanel';
import WeekGrid from './WeekGrid';

export interface ActiveSlot {
  day: DayName;
  index: number;
  isNew: boolean;
  original: Slot | null;
}

export default function HallCard({
  hall,
  weekStart,
  active,
  onToggleClosed,
  onClosedNoteChange,
  onAnnouncementChange,
  onToggleDayClosed,
  onDayClosureNoteChange,
  onSelectSlot,
  onDeleteSlot,
  onCreateSlot,
  onCommitTime,
  onSport,
  onTitle,
  onCancel,
  onDone,
}: {
  hall: Hall;
  weekStart: string;
  active: ActiveSlot | null;
  onToggleClosed: () => void;
  onClosedNoteChange: (v: string) => void;
  onAnnouncementChange: (v: string) => void;
  onToggleDayClosed: (day: DayName) => void;
  onDayClosureNoteChange: (day: DayName, v: string) => void;
  onSelectSlot: (day: DayName, index: number) => void;
  onDeleteSlot: (day: DayName, index: number) => void;
  onCreateSlot: (day: DayName, startMin: number, endMin: number) => void;
  onCommitTime: (field: 's' | 'e', value: string) => string | null;
  onSport: () => void;
  onTitle: (value: string) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  const activeSlot = active ? (hall.days[active.day] ?? [])[active.index] : undefined;
  const closedDays = DAY_ORDER.filter((day) => hall.dayClosures[day] !== undefined);

  return (
    <div className="hall-card">
      <div className="hall-head">
        <div className="hall-title">
          <span className="ic">{hall.icon}</span>
          <h2>אולם {hall.name}</h2>
        </div>
        <button type="button" className="toggle-closed" aria-pressed={hall.closed} onClick={onToggleClosed}>
          {hall.closed ? '🔧 סגור זמנית' : 'סמן כסגור השבוע'}
        </button>
      </div>

      <div className="ann-row">
        <label className="ann-label">📌 הודעת מנהלה (תופיע בתחתית הלוח, עם שם האולם בהתחלה)</label>
        <input
          type="text"
          className="ann-input"
          value={hall.announcement}
          placeholder="לדוגמה: חזרה מתוכננת לפעילות 4.10.26"
          onChange={(e) => onAnnouncementChange(e.target.value)}
        />
      </div>

      {hall.closed ? (
        <div className="warn-box">
          <div className="wtitle">🔧 הודעת סגירה</div>
          <textarea value={hall.closedNote} onChange={(e) => onClosedNoteChange(e.target.value)} />
        </div>
      ) : (
        <div className="week-shell">
          <div className="cal-hint">
            לחיצה על משבצת פנויה ביום הרצוי מוסיפה פעילות · לחיצה על פעילות קיימת פותחת אותה לעריכה · 🔒 ליד יום
            סוגר אותו · ה־✕ מוחק מיד
          </div>

          {active && activeSlot && (
            <SlotEditorPanel
              key={`${active.day}-${active.index}`}
              day={active.day}
              slot={activeSlot}
              isNew={active.isNew}
              onCommitTime={onCommitTime}
              onSport={onSport}
              onTitle={onTitle}
              onDelete={() => onDeleteSlot(active.day, active.index)}
              onCancel={onCancel}
              onDone={onDone}
            />
          )}

          <WeekGrid
            weekStart={weekStart}
            hall={hall}
            active={active}
            onToggleDayClosed={onToggleDayClosed}
            onSelectSlot={onSelectSlot}
            onDeleteSlot={onDeleteSlot}
            onCreateSlot={onCreateSlot}
          />

          {closedDays.length > 0 && (
            <div className="closed-days-panel">
              {closedDays.map((day) => (
                <div className="warn-box" key={day}>
                  <div className="wtitle">🔒 הודעת סגירה ליום {day}</div>
                  <textarea
                    value={hall.dayClosures[day] ?? ''}
                    placeholder="לדוגמה: האולם סגור לאימונים - התקנת גופי תאורה"
                    onChange={(e) => onDayClosureNoteChange(day, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
