'use client';

import type { DayName, Hall, Slot } from '@/lib/types';
import { DAY_ORDER } from '@/lib/types';
import { dateForDay, fmtDM } from '@/lib/scheduleLogic';
import DaySection from './DaySection';

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
  onAddSlot,
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
  onAddSlot: (day: DayName) => void;
  onSelectSlot: (day: DayName, index: number) => void;
  onDeleteSlot: (day: DayName, index: number) => void;
  onCreateSlot: (day: DayName, startMin: number, endMin: number) => void;
  onCommitTime: (field: 's' | 'e', value: string) => string | null;
  onSport: () => void;
  onTitle: (value: string) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
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
        <div className="week-days">
          <div className="cal-hint">
            לחיצה על משבצת פנויה מוסיפה פעילות · לחיצה על פעילות קיימת פותחת אותה לעריכה · ה־✕ מוחק מיד
          </div>
          {DAY_ORDER.map((day) => {
            const dayClosed = hall.dayClosures[day] !== undefined;
            const daySlots = hall.days[day] ?? [];
            const dayActive = active && active.day === day ? active : null;
            return (
              <DaySection
                key={day}
                day={day}
                date={fmtDM(dateForDay(weekStart, day))}
                slots={daySlots}
                dayClosed={dayClosed}
                dayClosureNote={hall.dayClosures[day] ?? ''}
                active={dayActive}
                onToggleDayClosed={() => onToggleDayClosed(day)}
                onDayClosureNoteChange={(v) => onDayClosureNoteChange(day, v)}
                onAddSlot={() => onAddSlot(day)}
                onSelectSlot={(index) => onSelectSlot(day, index)}
                onDeleteSlot={(index) => onDeleteSlot(day, index)}
                onCreateSlot={(startMin, endMin) => onCreateSlot(day, startMin, endMin)}
                onCommitTime={onCommitTime}
                onSport={onSport}
                onTitle={onTitle}
                onCancel={onCancel}
                onDone={onDone}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
