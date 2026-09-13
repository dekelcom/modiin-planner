import type { ScheduleState } from './types';

// Seed data ported from the original concept — real schedule for 13.9–18.9,
// used only the first time the app runs (before anyone has saved real data).
export const defaultSchedule: ScheduleState = {
  weekStart: '2026-09-12',
  halls: [
    {
      id: 'beerot',
      name: 'בארות יצחק',
      icon: '🏟️',
      closed: false,
      closedNote: '',
      announcement: '',
      dayClosures: {},
      days: {
        'ראשון': [{ s: '20:00', e: '22:00', sport: '🏀', title: 'כדורסל ליגה ב׳' }],
        'שני': [
          { s: '16:30', e: '18:00', sport: '🏀', title: 'כדורסל ליגות' },
          { s: '18:30', e: '20:30', sport: '🏀', title: 'כדורסל בוגרים לאומית' },
          { s: '20:30', e: '22:00', sport: '🏐', title: 'כדורשת נשים – שועלות החבל' },
        ],
        'שלישי': [{ s: '20:30', e: '22:00', sport: '🏐', title: 'כדורשת נשים – גייט אנד טרומן' }],
        'רביעי': [
          { s: '16:30', e: '18:00', sport: '🏀', title: 'כדורסל ליגות' },
          { s: '19:30', e: '21:20', sport: '🏀', title: 'כדורסל בוגרים לאומית' },
          { s: '21:30', e: '23:30', sport: '🏀', title: 'כדורסל ליגה ב׳ (לסירוגין)' },
        ],
        'חמישי': [{ s: '14:00', e: '16:00', sport: '🏀', title: 'כדורסל בוגרים לאומית' }],
        'שישי': [{ s: '11:00', e: '13:00', sport: '🏀', title: 'כדורסל בוגרים לאומית' }],
      },
    },
    {
      id: 'achisamech',
      name: 'אחיסמך',
      icon: '🏟️',
      closed: false,
      closedNote: '',
      announcement: '',
      dayClosures: {},
      days: {
        'שני': [{ s: '20:00', e: '22:00', sport: '🏀', title: 'כדורסל חובבני – סמי לזמי' }],
        'שלישי': [{ s: '20:30', e: '22:00', sport: '🏀', title: 'כדורסל נשים' }],
        'רביעי': [{ s: '20:30', e: '22:00', sport: '🏐', title: 'כדורשת נשים – ליידיס' }],
        'חמישי': [{ s: '20:30', e: '22:00', sport: '🏀', title: 'כדורסל נשים' }],
      },
    },
    {
      id: 'nachshon',
      name: 'נחשון',
      icon: '🏟️',
      closed: true,
      closedNote:
        '🔧 14–15.9 | שני–שלישי – התקנת גופי תאורה. האולם סגור לאימונים.\n🔧 16–17.9 | רביעי–חמישי – התקנת מחיצה. האולם סגור לאימונים.\n🔧 מ־20.9 ועד צאת חג סוכות – שיפוץ כללי הכולל חידוש הפרקט, ריפוד ואביזרים, שדרוג חדרי ההלבשה ועבודות נלוות.',
      announcement: 'חזרה מתוכננת לפעילות: 4.10.26, בכפוף לסיום העבודות ומוכנות האולם.',
      dayClosures: {},
      days: {},
    },
  ],
};
