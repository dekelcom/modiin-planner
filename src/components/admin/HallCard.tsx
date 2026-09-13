'use client';

import type { DayName, Hall, Slot } from '@/lib/types';
import DayTabs from './DayTabs';
import CalendarGrid from './CalendarGrid';
import SlotEditorPanel from './SlotEditorPanel';

export interface ActiveSlot {
  day: DayName;
  index: number;
  isNew: boolean;
  original: Slot | null;
}

export default function HallCard({
  hall,
  weekStart,
  selectedDay,
  active,
  onSelectDay,
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
  selectedDay: DayName;
  active: ActiveSlot | null;
  onSelectDay: (day: DayName) => void;
  onToggleClosed: () => void;
  onClosedNoteChange: (v: string) => void;
  onAnnouncementChange: (v: string) => void;
  onToggleDayClosed: () => void;
  onDayClosureNoteChange: (v: string) => void;
  onAddSlot: () => void;
  onSelectSlot: (index: number) => void;
  onDeleteSlot: (index: number) => void;
  onCreateSlot: (startMin: number, endMin: number) => void;
  onCommitTime: (field: 's' | 'e', value: string) => string | null;
  onSport: () => void;
  onTitle: (value: string) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  const dayClosed = hall.dayClosures[selectedDay] !== undefined;
  const slots = hall.days[selectedDay] ?? [];
  const activeSlot = active ? slots[active.index] : undefined;

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

      {hall.closed && (
        <div className="warn-box">
          <div className="wtitle">🔧 הודעת סגירה</div>
          <textarea value={hall.closedNote} onChange={(e) => onClosedNoteChange(e.target.value)} />
        </div>
      )}

      <DayTabs hall={hall} weekStart={weekStart} selectedDay={selectedDay} onSelect={onSelectDay} />

      <div className="cal-shell">
        <div className="day-status-row">
          <button type="button" className="toggle-day-closed" aria-pressed={dayClosed} onClick={onToggleDayClosed}>
            {dayClosed ? `🔒 יום ${selectedDay} סגור זמנית` : `סמן את יום ${selectedDay} כסגור`}
          </button>
        </div>

        {dayClosed ? (
          <div className="warn-box">
            <div className="wtitle">🔒 הודעת סגירה ליום {selectedDay}</div>
            <textarea
              value={hall.dayClosures[selectedDay] ?? ''}
              placeholder="לדוגמה: האולם סגור לאימונים - התקנת גופי תאורה"
              onChange={(e) => onDayClosureNoteChange(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="cal-hint">
              לחיצה על משבצת פנויה מוסיפה פעילות · לחיצה על פעילות קיימת פותחת אותה לעריכה · ה־✕ מוחק מיד
            </div>
            <div className="cal-actions">
              <button type="button" className="cal-add-btn" onClick={onAddSlot}>
                + הוספת פעילות
              </button>
            </div>

            {active && activeSlot ? (
              <SlotEditorPanel
                key={`${selectedDay}-${active.index}`}
                day={selectedDay}
                slot={activeSlot}
                isNew={active.isNew}
                onCommitTime={onCommitTime}
                onSport={onSport}
                onTitle={onTitle}
                onDelete={() => onDeleteSlot(active.index)}
                onCancel={onCancel}
                onDone={onDone}
              />
            ) : (
              <div className="se-empty">
                לא נבחרה פעילות — לחצו על &quot;+ הוספת פעילות&quot;, על משבצת פנויה בלוח, או על פעילות קיימת כדי
                לערוך.
              </div>
            )}

            <CalendarGrid
              slots={slots}
              activeIndex={active ? active.index : null}
              onCreate={onCreateSlot}
              onSelect={onSelectSlot}
              onDelete={onDeleteSlot}
            />
          </>
        )}
      </div>
    </div>
  );
}
