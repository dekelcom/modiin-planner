'use client';

import { useState } from 'react';
import type { DayName, Slot } from '@/lib/types';

function maskTime(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function SlotEditorPanel({
  day,
  slot,
  isNew,
  onCommitTime,
  onSport,
  onTitle,
  onDelete,
  onCancel,
  onDone,
}: {
  day: DayName;
  slot: Slot;
  isNew: boolean;
  onCommitTime: (field: 's' | 'e', value: string) => string | null;
  onSport: () => void;
  onTitle: (value: string) => void;
  onDelete: () => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  // Local echo of the time fields so a rejected edit can revert without
  // fighting the parent's committed value; remounted (via `key`) whenever
  // the active slot changes, so it always starts in sync.
  const [sVal, setSVal] = useState(slot.s);
  const [eVal, setEVal] = useState(slot.e);
  const [msg, setMsg] = useState('');

  function commit(field: 's' | 'e', value: string) {
    const error = onCommitTime(field, value);
    if (error) {
      setMsg(error);
      if (field === 's') setSVal(slot.s);
      else setEVal(slot.e);
    } else {
      setMsg('');
    }
  }

  return (
    <div className="slot-editor">
      <div className="se-title">
        {isNew ? '✏️ פעילות חדשה' : '✏️ עריכת פעילות'} — יום {day}
      </div>
      <div className="se-row">
        <input
          type="text"
          className="time"
          maxLength={5}
          placeholder="##:##"
          inputMode="numeric"
          value={sVal}
          onChange={(e) => setSVal(maskTime(e.target.value))}
          onBlur={() => commit('s', sVal)}
        />
        <span>–</span>
        <input
          type="text"
          className="time"
          maxLength={5}
          placeholder="##:##"
          inputMode="numeric"
          value={eVal}
          onChange={(e) => setEVal(maskTime(e.target.value))}
          onBlur={() => commit('e', eVal)}
        />
      </div>
      <div className="se-row">
        <button type="button" className="sport-btn" onClick={onSport} title="החלף סוג ענף">
          {slot.sport}
        </button>
        <input
          type="text"
          className="title"
          placeholder="שם הפעילות / קבוצה"
          value={slot.title}
          onChange={(e) => onTitle(e.target.value)}
        />
      </div>
      <div className="se-msg">{msg}</div>
      <div className="se-actions">
        <button type="button" className="se-btn danger" onClick={onDelete}>
          מחיקה
        </button>
        <button type="button" className="se-btn" onClick={onCancel}>
          ביטול
        </button>
        <button type="button" className="se-btn primary" onClick={onDone}>
          סיום עריכה
        </button>
      </div>
    </div>
  );
}
