import React, { useCallback, useEffect, useState } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { warmUpGoogle } from '../lib/googleAuth';
import { isAdminUser } from '../lib/admin';

// Admin area (/admin/): how many people use the two editions. Only Marco's
// Google account gets numbers; api/stats.js checks the token with Google, so
// this page holds no secret and shows nothing to anyone else.

type AppId = 'zeitreise' | 'gaming';
interface Day {
  day: string;
  starts: number;
  visitors: number;
}
interface Stats {
  configured: boolean;
  since?: string | null;
  days?: string[];
  apps?: Record<AppId, { totalStarts: number; daily: Day[] }>;
}
type Load =
  | { state: 'idle' | 'loading' | 'forbidden' | 'error' }
  | { state: 'ready'; stats: Stats };

const APP_LABELS: Record<AppId, string> = { zeitreise: 'Zeitreise', gaming: 'Gaming' };
const RANGES = [7, 30, 90];

const fmtDay = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};
const sum = (days: Day[], key: 'starts' | 'visitors') => days.reduce((n, d) => n + d[key], 0);

export const AdminApp: React.FC = () => {
  const auth = useGoogleAuth();
  const [range, setRange] = useState(30);
  const [load, setLoad] = useState<Load>({ state: 'idle' });

  const fetchStats = useCallback(async () => {
    const token = await auth.getFreshAccessToken();
    if (!token) return;
    setLoad({ state: 'loading' });
    try {
      const res = await fetch(`/api/stats?days=${range}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403) return setLoad({ state: 'forbidden' });
      if (!res.ok) return setLoad({ state: 'error' });
      setLoad({ state: 'ready', stats: await res.json() });
    } catch {
      setLoad({ state: 'error' });
    }
  }, [auth.getFreshAccessToken, range]);

  useEffect(() => {
    if (auth.status === 'signed_in') fetchStats();
  }, [auth.status, fetchStats]);

  const signedIn = auth.status === 'signed_in';

  return (
    <main className="admin">
      <header className="admin-head">
        <div>
          <p className="eyebrow">RetroMind · nur für den Betreiber</p>
          <h1>Adminbereich</h1>
        </div>
        <a className="btn ghost" href="/">
          ← Zur App
        </a>
      </header>

      {auth.status === 'not_configured' && <p className="note">Google-Anmeldung ist auf dieser Seite nicht eingerichtet.</p>}

      {!signedIn && auth.status !== 'not_configured' && (
        <section className="card">
          <p>Melde dich mit deinem Google-Konto an. Zahlen sieht nur das Konto des Betreibers.</p>
          <button
            className="btn"
            onClick={auth.signIn}
            onPointerEnter={warmUpGoogle}
            onPointerDown={warmUpGoogle}
            onFocus={warmUpGoogle}
            disabled={auth.status === 'signing_in'}
          >
            {auth.status === 'signing_in' ? 'Anmeldung läuft …' : 'Mit Google anmelden'}
          </button>
          {auth.status === 'error' && <p className="note">Die Anmeldung hat nicht geklappt. Bitte noch einmal.</p>}
        </section>
      )}

      {signedIn && (
        <>
          <div className="toolbar">
            <span className="who">
              Angemeldet als {auth.user?.email}
              <button className="link" onClick={auth.signOut}>
                Abmelden
              </button>
            </span>
            <div className="ranges" role="radiogroup" aria-label="Zeitraum">
              {RANGES.map((n) => (
                <button key={n} role="radio" aria-checked={range === n} className="btn small" onClick={() => setRange(n)}>
                  {n} Tage
                </button>
              ))}
            </div>
          </div>

          {load.state === 'loading' && <p className="note">Zahlen werden geladen …</p>}
          {load.state === 'forbidden' && (
            <section className="card">
              <p>Dieses Google-Konto hat keinen Zugang zum Adminbereich.</p>
              {isAdminUser(auth.user) && <p className="note">Bitte ab- und wieder anmelden.</p>}
            </section>
          )}
          {load.state === 'error' && (
            <section className="card">
              <p>Die Zahlen konnten nicht geladen werden.</p>
              <button className="btn" onClick={fetchStats}>
                Noch einmal
              </button>
            </section>
          )}
          {load.state === 'ready' && !load.stats.configured && (
            <section className="card">
              <p>
                <strong>Der Zähler hat noch keinen Speicher.</strong> In Vercel unter Storage eine kostenlose Upstash-Redis-Datenbank
                anlegen und mit beiden Projekten (retromind und retromind-gaming) verbinden, danach neu deployen.
              </p>
            </section>
          )}
          {load.state === 'ready' && load.stats.configured && load.stats.apps && (
            <>
              {(Object.keys(APP_LABELS) as AppId[]).map((app) => (
                <AppStats key={app} label={APP_LABELS[app]} data={load.stats.apps![app]} />
              ))}
              <p className="note">
                Gezählt wird anonym{load.stats.since ? ` seit ${fmtDay(load.stats.since)}` : ''}: ohne Cookies und ohne
                gespeicherte IP-Adressen. Ein Besucher zählt einmal pro Tag und App. Wer an mehreren Tagen kommt, zählt an jedem
                Tag neu, deshalb sind die Summen über mehrere Tage „Besuche“, keine verschiedenen Personen.
              </p>
            </>
          )}
        </>
      )}
    </main>
  );
};

const AppStats: React.FC<{ label: string; data: { totalStarts: number; daily: Day[] } }> = ({ label, data }) => {
  const days = data.daily;
  const today = days[days.length - 1];
  const last7 = days.slice(-7);
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const shown = hover !== null ? days[hover] : null;

  return (
    <section className="card">
      <h2>{label}</h2>
      <div className="tiles">
        <Tile value={today?.visitors ?? 0} label="Besucher heute" />
        <Tile value={sum(last7, 'visitors')} label="Besuche, 7 Tage" />
        <Tile value={sum(days, 'visitors')} label={`Besuche, ${days.length} Tage`} />
        <Tile value={data.totalStarts} label="App-Starts gesamt" />
      </div>

      <div className="chart-head">
        <span>Besucher pro Tag</span>
        <span className="readout" aria-live="polite">
          {shown ? `${fmtDay(shown.day)}: ${shown.visitors} Besucher, ${shown.starts} Starts` : `max. ${max} an einem Tag`}
        </span>
      </div>
      <div className="bars" onPointerLeave={() => setHover(null)}>
        {days.map((d, i) => (
          <button
            key={d.day}
            className={`bar${hover === i ? ' on' : ''}`}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${fmtDay(d.day)}: ${d.visitors} Besucher, ${d.starts} Starts`}
          >
            <span style={{ height: `${(d.visitors / max) * 100}%` }} />
          </button>
        ))}
      </div>
      <div className="axis">
        <span>{fmtDay(days[0].day)}</span>
        <span>heute</span>
      </div>

      <details>
        <summary>Als Tabelle</summary>
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Besucher</th>
              <th>App-Starts</th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.day}>
                <td>{fmtDay(d.day)}</td>
                <td>{d.visitors}</td>
                <td>{d.starts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
};

const Tile: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="tile">
    <strong>{value.toLocaleString('de-DE')}</strong>
    <span>{label}</span>
  </div>
);
