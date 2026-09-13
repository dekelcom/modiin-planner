'use client';

import type { DayName, Slot } from '@/lib/types';
import CalendarGrid from './CalendarGrid';
import SlotEditorPanel from './SlotEditorPanel';
import type { ActiveSlot } from './HallCard';

export default function DaySection({
  day,
  date,
  slots,
  dayClosed,
  dayClosureNote,
  active,
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
  day: DayName;
  date: string;
  slots: Slot[];
  dayClosed: boolean;
  dayClosureNote: string;
  active: ActiveSlot | null;
  onToggleDayClosed: () => void;
  onDayClosureNoteChange: (value: string) => void;
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
  const activeSlot = active ? slots[active.index] : undefined;

  return (
    <div className="day-section">
      <div className="day-section-head">
        <div className="ds-title">
          <span className="ds-day">יום {day}</span>
          <span className="ds-date" dir="ltr">
            {date}
          </span>
          {!dayClosed && slots.length > 0 && <span className="ds-count">{slots.length}</span>}
        </div>
        <button type="button" className="toggle-day-closed" aria-pressed={dayClosed} onClick={onToggleDayClosed}>
          {dayClosed ? '🔒 סגור' : 'סמן כסגור'}
        </button>
      </div>

      {dayClosed ? (
        <div className="warn-box">
          <div className="wtitle">🔒 הודעת סגירה ליום {day}</div>
          <textarea
            value={dayClosureNote}
            placeholder="לדוגמה: האולם סגור לאימונים - התקנת גופי תאורה"
            onChange={(e) => onDayClosureNoteChange(e.target.value)}
          />
        </div>
      ) : (
        <>
          <div className="cal-actions">
            <button type="button" className="cal-add-btn" onClick={onAddSlot}>
              + הוספת פעילות
            </button>
          </div>

          {active && activeSlot && (
            <SlotEditorPanel
              key={`${day}-${active.index}`}
              day={day}
              slot={activeSlot}
              isNew={active.isNew}
              onCommitTime={onCommitTime}
              onSport={onSport}
              onTitle={onTitle}
              onDelete={() => onDeleteSlot(active.index)}
              onCancel={onCancel}
              onDone={onDone}
            />
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
  );
}
