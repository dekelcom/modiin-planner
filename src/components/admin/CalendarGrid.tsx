'use client';

import type { Slot } from '@/lib/types';
import { CAL_END_H, CAL_START_H, PX_PER_MIN, toMin } from '@/lib/scheduleLogic';

export default function CalendarGrid({
  slots,
  activeIndex,
  onCreate,
  onSelect,
  onDelete,
}: {
  slots: Slot[];
  activeIndex: number | null;
  onCreate: (startMin: number, endMin: number) => void;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  const totalMin = (CAL_END_H - CAL_START_H) * 60;
  const hours: number[] = [];
  for (let h = CAL_START_H; h <= CAL_END_H; h++) hours.push(h);

  function handleGridClick(e: React.MouseEvent<HTMLDivElement>) {
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
    onCreate(startMin, endMin);
  }

  return (
    <div className="cal-wrap">
      <div className="cal-gutter" style={{ height: totalMin * PX_PER_MIN }}>
        {hours.map((h) => (
          <div className="hr" key={h} style={{ top: (h - CAL_START_H) * 60 * PX_PER_MIN }}>
            {String(h % 24).padStart(2, '0')}:00
          </div>
        ))}
      </div>
      <div
        className="cal-grid"
        style={{ height: totalMin * PX_PER_MIN, backgroundSize: `100% ${60 * PX_PER_MIN}px` }}
        onClick={handleGridClick}
      >
        {slots.map((slot, i) => {
          const sMin = toMin(slot.s);
          const eMin = toMin(slot.e);
          return (
            <div
              key={i}
              className={`cal-block ${slot.sport === '🏀' ? 'sport-ball' : 'sport-net'}${
                activeIndex === i ? ' selected' : ''
              }`}
              style={{
                top: (sMin - CAL_START_H * 60) * PX_PER_MIN,
                height: Math.max(22, (eMin - sMin) * PX_PER_MIN - 2),
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(i);
              }}
            >
              <div className="cb-body">
                <span className="cb-time" dir="ltr">
                  {slot.s}–{slot.e}
                </span>
                <span className="cb-title">
                  {slot.sport} {slot.title || '(ללא שם)'}
                </span>
              </div>
              <button
                type="button"
                className="cb-del"
                title="מחיקה"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(i);
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
