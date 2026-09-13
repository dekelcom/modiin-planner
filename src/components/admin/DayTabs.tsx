'use client';

import type { DayName, Hall } from '@/lib/types';
import { DAY_ORDER } from '@/lib/types';
import { dateForDay, fmtDM } from '@/lib/scheduleLogic';

export default function DayTabs({
  hall,
  weekStart,
  selectedDay,
  onSelect,
}: {
  hall: Hall;
  weekStart: string;
  selectedDay: DayName;
  onSelect: (day: DayName) => void;
}) {
  return (
    <div className="day-tabs" role="tablist">
      {DAY_ORDER.map((day) => {
        const count = hall.days[day]?.length ?? 0;
        const closed = hall.dayClosures[day] !== undefined;
        return (
          <button
            key={day}
            type="button"
            role="tab"
            className={`day-tab${closed ? ' day-closed' : ''}`}
            aria-selected={selectedDay === day}
            onClick={() => onSelect(day)}
          >
            <span>{day}</span>
            <span className="dt-date">{fmtDM(dateForDay(weekStart, day))}</span>
            {closed ? (
              <span className="dt-lock">🔒</span>
            ) : count > 0 ? (
              <span className="dt-badge">{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
