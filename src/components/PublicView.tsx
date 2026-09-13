'use client';

import { useRef, useState } from 'react';
import type { ScheduleState } from '@/lib/types';
import {
  announcementLines,
  buildWaText,
  dayCellDays,
  fmtDM,
  hallColor,
  hallNameLine,
  posterDays,
  weekRangeLabel,
} from '@/lib/scheduleLogic';
import { dateForDay } from '@/lib/scheduleLogic';

export default function PublicView({ initialData }: { initialData: ScheduleState }) {
  const [tab, setTab] = useState<'week' | 'poster'>('week');
  const state = initialData;
  const range = weekRangeLabel(state.weekStart);
  const nameLine = hallNameLine(state.halls);
  const waText = buildWaText(state);
  const announcements = announcementLines(state.halls);

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <h1 className="app-title">📋 לוח פעילות אולמות</h1>
          <p className="app-sub">
            {nameLine} · <span dir="ltr">{range}</span>
          </p>
        </div>
        <a className="link-btn" href="/admin">
          🛠 כניסת מנהל
        </a>
      </div>

      <nav className="tabs-nav">
        <button data-active={tab === 'week'} onClick={() => setTab('week')} type="button">
          📣 לוח השבוע
        </button>
        <button data-active={tab === 'poster'} onClick={() => setTab('poster')} type="button">
          🖼️ פוסטר לשיתוף
        </button>
      </nav>

      {tab === 'week' && (
        <>
          <div className="publish-card">
            <div className="publish-head">
              📋 לוח פעילות אולמות – {nameLine}{' '}
              <span className="range" dir="ltr">
                | {range}
              </span>
            </div>
            <div className="publish-sub">תקף מוצ״ש עד יום שישי</div>

            {state.halls.map((hall) => {
              const days = hall.closed ? [] : dayCellDays(hall);
              return (
                <div className="p-hall" key={hall.id}>
                  <h3>
                    {hall.icon} אולם {hall.name}
                  </h3>
                  {hall.closed ? (
                    <div className="p-warn">
                      {hall.closedNote
                        .split('\n')
                        .filter(Boolean)
                        .map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                    </div>
                  ) : days.length === 0 ? (
                    <div className="p-day">
                      <span className="d" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                        אין פעילות מתוכננת השבוע
                      </span>
                    </div>
                  ) : (
                    days.map((day) => (
                      <div className="p-day" key={day}>
                        <div className="d">יום {day}</div>
                        {hall.dayClosures[day] !== undefined ? (
                          <div className="p-day-closed">🔒 {hall.dayClosures[day] || 'האולם סגור ביום זה'}</div>
                        ) : (
                          <ul>
                            {(hall.days[day] ?? []).map((slot, i) => (
                              <li key={i}>
                                <span className="t" dir="ltr">
                                  {slot.s}–{slot.e}
                                </span>
                                <span>
                                  {slot.sport} {slot.title || '(ללא שם)'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })}

            {announcements.length > 0 && (
              <div className="p-announce">
                {announcements.map((line, i) => (
                  <div key={i}>📌 {line}</div>
                ))}
              </div>
            )}

            <div className="p-footer">נא להיערך בהתאם ולעדכן את המאמנים והקבוצות הרלוונטיות.</div>
          </div>

          <CopyBlock text={waText} />
        </>
      )}

      {tab === 'poster' && <PosterBlock state={state} nameLine={nameLine} range={range} />}
    </div>
  );
}

function CopyBlock({ text }: { text: string }) {
  const [status, setStatus] = useState('העתק טקסט');
  const taRef = useRef<HTMLTextAreaElement>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('הועתק ✓');
    } catch {
      taRef.current?.focus();
      taRef.current?.select();
      setStatus('סמנתי בשבילך — Ctrl+C');
    }
    setTimeout(() => setStatus('העתק טקסט'), 1800);
  }

  return (
    <div className="copy-block">
      <div className="lbl">
        <span>📋 טקסט מוכן להעתקה לוואטסאפ</span>
        <button className="copy-btn" type="button" onClick={handleCopy}>
          {status}
        </button>
      </div>
      <textarea id="waText" ref={taRef} readOnly value={text} />
    </div>
  );
}

function PosterBlock({ state, nameLine, range }: { state: ScheduleState; nameLine: string; range: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const days = posterDays(state.halls);
  const announcements = announcementLines(state.halls);

  async function renderCanvas(): Promise<HTMLCanvasElement | null> {
    if (!cardRef.current) return null;
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(cardRef.current, { scale: 2, backgroundColor: '#ffffff' });
  }

  async function makeImage() {
    setBusy(true);
    setShareMsg('');
    try {
      const canvas = await renderCanvas();
      if (canvas) setImgSrc(canvas.toDataURL('image/jpeg', 0.92));
    } catch {
      setShareMsg('לא הצלחנו להכין תמונה — נסו שוב.');
    } finally {
      setBusy(false);
    }
  }

  function downloadImage() {
    if (!imgSrc) return;
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = `לוח-פעילות-${range.replace(/[^\d–]/g, '')}.jpg`;
    a.click();
  }

  async function shareToWhatsapp() {
    setBusy(true);
    setShareMsg('');
    try {
      const canvas = await renderCanvas();
      if (!canvas) throw new Error('no-canvas');
      setImgSrc(canvas.toDataURL('image/jpeg', 0.92));

      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) throw new Error('no-blob');
      const file = new File([blob], 'לוח-פעילות.jpg', { type: 'image/jpeg' });
      const caption = `📋 לוח פעילות אולמות – ${nameLine} | ${range}`;

      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
        share?: (data: ShareData) => Promise<void>;
      };

      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'לוח פעילות אולמות', text: caption });
      } else {
        // This browser can't attach a file to a share sheet — open WhatsApp
        // with the caption text ready, and leave the image below so it can
        // be saved and attached to the message by hand.
        window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank', 'noopener,noreferrer');
        setShareMsg('הדפדפן הזה לא תומך בצירוף תמונה ישירות — פתחנו את וואטסאפ עם הכיתוב, והתמונה מוכנה למטה לשמירה ולצירוף ידני.');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setShareMsg('השיתוף לא הצליח — אפשר להשתמש ב"הורדת התמונה" ולשתף ידנית.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="poster-frame">
        <div className="poster-card" ref={cardRef}>
          <div className="poster-header">
            <div className="poster-title">📋 לוח פעילות אולמות</div>
            <div className="poster-sub">
              {nameLine} · <span dir="ltr">{range}</span>
            </div>
          </div>
          <div className="poster-table-wrap">
            <table className="poster-table">
              <thead>
                <tr>
                  <th className="pt-daycol">יום ותאריך</th>
                  {state.halls.map((h, i) => (
                    <th key={h.id} style={{ background: hallColor(h, i) }}>
                      {h.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, di) => (
                  <tr key={day} className={di % 2 ? 'alt' : ''}>
                    <td className="pt-daycol">
                      <span className="pt-day">{day}</span>
                      <span className="pt-date">{fmtDM(dateForDay(state.weekStart, day))}</span>
                    </td>
                    {state.halls.map((hall) => {
                      if (hall.closed) {
                        if (di !== 0) return null;
                        const chips = hall.closedNote.split('\n').filter(Boolean);
                        return (
                          <td className="pt-closed" rowSpan={days.length} key={hall.id}>
                            <div className="pt-closed-inner">
                              {chips.map((line, i) => (
                                <div className="pt-chip" key={i}>
                                  {line}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      }
                      if (hall.dayClosures[day] !== undefined) {
                        return (
                          <td className="pt-daylock" key={hall.id}>
                            🔒 {hall.dayClosures[day] || 'סגור'}
                          </td>
                        );
                      }
                      const list = hall.days[day] ?? [];
                      if (!list.length) {
                        return (
                          <td className="pt-empty" key={hall.id}>
                            —
                          </td>
                        );
                      }
                      return (
                        <td key={hall.id}>
                          {list.map((slot, i) => (
                            <div className="pt-slot" key={i}>
                              <b dir="ltr">
                                {slot.s}–{slot.e}
                              </b>
                              <br />
                              {slot.sport} {slot.title || '(ללא שם)'}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {announcements.length > 0 && (
            <div className="poster-announce">
              {announcements.map((line, i) => (
                <div className="pa-line" key={i}>
                  📌 {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="poster-share">
        <button className="poster-share-btn primary" type="button" onClick={shareToWhatsapp} disabled={busy}>
          {busy ? 'מכין…' : '💬 פרסם בוואטסאפ'}
        </button>
        <button className="poster-share-btn ghost" type="button" onClick={makeImage} disabled={busy}>
          {busy ? 'מכין תמונה…' : '🖼️ הצג תמונה לשמירה'}
        </button>
        {shareMsg && <p className="poster-share-msg">{shareMsg}</p>}
        {imgSrc && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- runtime data: URI, not a static asset */}
            <img src={imgSrc} alt="תמונת הפוסטר" style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} />
            <button className="poster-share-btn ghost" type="button" onClick={downloadImage}>
              ⬇️ הורדת התמונה
            </button>
          </>
        )}
      </div>
    </>
  );
}
