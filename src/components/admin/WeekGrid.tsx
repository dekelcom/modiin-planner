'use client';

import type { DayName, Hall, Slot } from '@/lib/types';
import { DAY_ORDER } from '@/lib/types';
import { CAL_END_H, CAL_START_H, PX_PER_MIN, dateForDay, fmtDM, toMin } from '@/lib/scheduleLogic';
import type { ActiveSlot } from './HallCard';

export default function WeekGrid({
  weekStart,
  hall,
  active,
  onToggleDayClosed,
  onSelectSlot,
  onDeleteSlot,
  onCreateSlot,
}: {
  weekStart: string;
  hall: Hall;
  active: ActiveSlot | null;
  onToggleDayClosed: (day: DayName) => void;
  onSelectSlot: (day: DayName, index: number) => void;
  onDeleteSlot: (day: DayName, index: number) => void;
  onCreateSlot: (day: DayName, startMin: number, endMin: number) => void;
}) {
  const totalMin = (CAL_END_H - CAL_START_H) * 60;
  const totalHeight = totalMin * PX_PER_MIN;
  const hours: number[] = [];
  for (let h = CAL_START_H; h <= CAL_END_H; h++) hours.push(h);

  function handleColClick(day: DayName, e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    let startMin = CAL_START_H * 60 + offsetY / PX_PER_MIN;
    startMin = Math.round(startMin / 15) * 15;
    let endMin = startMin + 60;
    if (endMin > CAL_END_H * 60) {
      endMin = CAL_END_H * 60;
      startMin = endMin - 60;
    }
    onCreateSlot(day, startMin, endMin);
  }

  return (
    <div className="week-grid" style={{ gridTemplateColumns: `40px repeat(${DAY_ORDER.length}, 1fr)` }}>
      <div className="wg-corner" />
      {DAY_ORDER.map((day) => {
        const closed = hall.dayClosures[day] !== undefined;
        return (
          <div className="wg-day-head" key={day}>
            <span className="wg-day-name">{day}</span>
            <span className="wg-day-date" dir="ltr">
              {fmtDM(dateForDay(weekStart, day))}
            </span>
            <button
              type="button"
              className="wg-lock-btn"
              aria-pressed={closed}
              title={closed ? 'האולם פתוח שוב ביום זה' : 'סמן יום זה כסגור'}
              onClick={() => onToggleDayClosed(day)}
            >
              {closed ? '🔒' : '🔓'}
            </button>
          </div>
        );
      })}

      <div className="wg-gutter" style={{ height: totalHeight }}>
        {hours.map((h) => (
          <div className="hr" key={h} style={{ top: (h - CAL_START_H) * 60 * PX_PER_MIN }}>
            {String(h % 24).padStart(2, '0')}:00
          </div>
        ))}
      </div>

      {DAY_ORDER.map((day) => {
        const closed = hall.dayClosures[day] !== undefined;
        const slots: Slot[] = hall.days[day] ?? [];
        return (
          <div
            key={day}
            className={`wg-col${closed ? ' closed' : ''}`}
            style={{ height: totalHeight, backgroundSize: `100% ${60 * PX_PER_MIN}px` }}
            onClick={closed ? undefined : (e) => handleColClick(day, e)}
          >
            {closed ? (
              <div className="wg-closed-mark">🔒</div>
            ) : (
              slots.map((slot, i) => {
                const sMin = toMin(slot.s);
                const eMin = toMin(slot.e);
                const isActive = active?.day === day && active.index === i;
                return (
                  <div
                    key={i}
                    className={`wg-block ${slot.sport === '🏀' ? 'sport-ball' : 'sport-net'}${
                      isActive ? ' selected' : ''
                    }`}
                    style={{
                      top: (sMin - CAL_START_H * 60) * PX_PER_MIN,
                      height: Math.max(18, (eMin - sMin) * PX_PER_MIN - 2),
                    }}
                    title={`${slot.s}–${slot.e} ${slot.title || ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSlot(day, i);
                    }}
                  >
                    <div className="wgb-line1">
                      <span className="wgb-emoji">{slot.sport}</span>
                      <span className="wgb-time" dir="ltr">
                        {slot.s}
                      </span>
                    </div>
                    <div className="wgb-title">{slot.title || '(ללא שם)'}</div>
                    <button
                      type="button"
                      className="wgb-del"
                      title="מחיקה"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlot(day, i);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
