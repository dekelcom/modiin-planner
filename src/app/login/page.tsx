'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'שגיאה בהתחברות');
        setBusy(false);
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('שגיאת רשת, נסו שוב');
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="app-title">🔒 כניסת מנהל</h1>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="קוד גישה"
        />
        <div className="login-error">{error}</div>
        <button type="submit" disabled={busy || !pin}>
          {busy ? 'בודק…' : 'כניסה'}
        </button>
      </form>
    </div>
  );
}
