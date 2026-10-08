import React, { useCallback, useEffect, useState } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { warmUpGoogle } from '../lib/googleAuth';
import { isAdminUser } from '../lib/admin';

// Admin area (/admin/), only for Marco: usage numbers (api/stats.js), the
// feedback inbox and a live check of both domains (api/admin.js). Every API
// checks the Google token with Google, so this page holds no secret and shows
// nothing to anyone else.

type AppId = 'zeitreise' | 'gaming';
type Tab = 'usage' | 'feedback' | 'live';
interface Day {
  day: string;
  starts: number;
  visitors: number;
}
interface TopEntry {
  key: string;
  count: number;
}
interface AppStatsData {
  totalStarts: number;
  daily: Day[];
  devices: { phone: number; tablet: number; desktop: number; installed: number };
  top: Record<string, { month: TopEntry[]; all: TopEntry[] }>;
}
interface Stats {
  configured: boolean;
  since?: string | null;
  month?: string;
  apps?: Record<AppId, AppStatsData>;
}
interface FeedbackEntry {
  id: string;
  date: string;
  categoryLabel: string;
  status: 'offen' | 'übernommen' | 'erledigt';
  text: string;
}
interface LiveDomain {
  id: string;
  label: string;
  url: string;
  project: string;
  sha: string | null;
  state: 'current' | 'stale' | 'unknown' | 'unreachable';
  behind: number;
}
interface Live {
  master: { sha: string; message: string; date: string };
  domains: LiveDomain[];
}
type Load<T> = { state: 'idle' | 'loading' | 'forbidden' | 'error' } | { state: 'ready'; data: T };

const APP_LABELS: Record<AppId, string> = { zeitreise: 'Zeitreise', gaming: 'Gaming' };
const TOP_LABELS: Record<string, string> = {
  decade: 'Meist erkundete Jahrzehnte',
  game: 'Meist geöffnete Spiele',
  minigame: 'Meist gespielte Minispiele',
};
const RANGES = [7, 30, 90];
const TABS: { id: Tab; label: string }[] = [
  { id: 'usage', label: 'Nutzung' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'live', label: 'Live-Check' },
];
// Feedback and the live check need the GitHub token, which only the main
// project has; on the Gaming domain the page asks the main domain for them.
const MAIN_API =
  typeof window !== 'undefined' && window.location.hostname === 'retromind-gaming.vercel.app'
    ? 'https://retromind.vercel.app'
    : '';

const fmtDay = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
};
const fmtMonth = (ym?: string) => {
  if (!ym) return 'diesen Monat';
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
};
const sum = (days: Day[], key: 'starts' | 'visitors') => days.reduce((n, d) => n + d[key], 0);
const decadeLabel = (key: string) => (/^\d{4}$/.test(key) ? `${key}er` : key);

export const AdminApp: React.FC = () => {
  const auth = useGoogleAuth();
  const [tab, setTab] = useState<Tab>('usage');
  const signedIn = auth.status === 'signed_in';

  // One authorized fetch for all tabs: a 403 means "not Marco", anything else
  // that fails is shown as an error with a retry button.
  const api = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<Load<T>> => {
      const token = await auth.getFreshAccessToken();
      if (!token) return { state: 'idle' };
      try {
        const res = await fetch(url, {
          ...init,
          headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
        });
        if (res.status === 403) return { state: 'forbidden' };
        if (!res.ok) return { state: 'error' };
        return { state: 'ready', data: (await res.json()) as T };
      } catch {
        return { state: 'error' };
      }
    },
    [auth.getFreshAccessToken],
  );

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
          <p className="who">
            Angemeldet als {auth.user?.email}
            <button className="link" onClick={auth.signOut}>
              Abmelden
            </button>
          </p>
          <nav className="tabs" role="tablist" aria-label="Bereiche">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className="btn small" onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          {tab === 'usage' && <UsageTab api={api} isAdmin={isAdminUser(auth.user)} />}
          {tab === 'feedback' && <FeedbackTab api={api} />}
          {tab === 'live' && <LiveTab api={api} />}
        </>
      )}
    </main>
  );
};

type Api = <T>(url: string, init?: RequestInit) => Promise<Load<T>>;

const Problem: React.FC<{ load: Load<unknown>; onRetry: () => void; isAdmin?: boolean }> = ({ load, onRetry, isAdmin }) => {
  if (load.state === 'loading') return <p className="note">Wird geladen …</p>;
  if (load.state === 'forbidden')
    return (
      <section className="card">
        <p>Dieses Google-Konto hat keinen Zugang zum Adminbereich.</p>
        {isAdmin && <p className="note">Bitte ab- und wieder anmelden.</p>}
      </section>
    );
  if (load.state === 'error')
    return (
      <section className="card">
        <p>Das konnte nicht geladen werden.</p>
        <button className="btn" onClick={onRetry}>
          Noch einmal
        </button>
      </section>
    );
  return null;
};

// ---------------------------------------------------------------- Nutzung

const UsageTab: React.FC<{ api: Api; isAdmin: boolean }> = ({ api, isAdmin }) => {
  const [range, setRange] = useState(30);
  const [load, setLoad] = useState<Load<Stats>>({ state: 'loading' });
  const fetchStats = useCallback(async () => {
    setLoad({ state: 'loading' });
    setLoad(await api<Stats>(`/api/stats?days=${range}`));
  }, [api, range]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      <div className="ranges" role="radiogroup" aria-label="Zeitraum">
        {RANGES.map((n) => (
          <button key={n} role="radio" aria-checked={range === n} className="btn small" onClick={() => setRange(n)}>
            {n} Tage
          </button>
        ))}
      </div>
      <Problem load={load} onRetry={fetchStats} isAdmin={isAdmin} />
      {load.state === 'ready' && !load.data.configured && (
        <section className="card">
          <p>
            <strong>Der Zähler hat noch keinen Speicher.</strong> In Vercel unter Storage eine kostenlose Upstash-Redis-Datenbank
            anlegen und mit beiden Projekten (retromind und retromind-gaming) verbinden, danach neu deployen.
          </p>
        </section>
      )}
      {load.state === 'ready' && load.data.configured && load.data.apps && (
        <>
          {(Object.keys(APP_LABELS) as AppId[]).map((app) => (
            <AppStats key={app} label={APP_LABELS[app]} data={load.data.apps![app]} month={load.data.month} />
          ))}
          <p className="note">
            Gezählt wird anonym{load.data.since ? ` seit ${fmtDay(load.data.since)}` : ''}: ohne Cookies und ohne gespeicherte
            IP-Adressen. Ein Besucher zählt einmal pro Tag und App. Wer an mehreren Tagen kommt, zählt an jedem Tag neu, deshalb
            sind die Summen über mehrere Tage „Besuche“, keine verschiedenen Personen. Geräte zählen pro App-Start, Beliebtes
            einmal pro Besuch und Eintrag; Geräte und Beliebtes gibt es seit dem 08.10.2026.
          </p>
        </>
      )}
    </>
  );
};

const AppStats: React.FC<{ label: string; data: AppStatsData; month?: string }> = ({ label, data, month }) => {
  const days = data.daily;
  const today = days[days.length - 1];
  const last7 = days.slice(-7);
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const shown = hover !== null ? days[hover] : null;
  const dev = data.devices;
  const devTotal = dev.phone + dev.tablet + dev.desktop;

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

      <h3>Geräte, {days.length} Tage</h3>
      {devTotal === 0 ? (
        <p className="note">Noch keine Daten.</p>
      ) : (
        <>
          <Rows
            rows={[
              { key: 'Handy', count: dev.phone },
              { key: 'Tablet', count: dev.tablet },
              { key: 'Computer', count: dev.desktop },
            ]}
            total={devTotal}
          />
          <p className="note">
            Davon als App installiert geöffnet: {dev.installed.toLocaleString('de-DE')} von {devTotal.toLocaleString('de-DE')}{' '}
            Starts ({Math.round((dev.installed / devTotal) * 100)} %).
          </p>
        </>
      )}

      {Object.entries(data.top).map(([kind, lists]) => (
        <div key={kind}>
          <h3>{TOP_LABELS[kind] ?? kind}</h3>
          <div className="top-grid">
            <TopList title={fmtMonth(month)} list={lists.month} kind={kind} />
            <TopList title="Insgesamt" list={lists.all} kind={kind} />
          </div>
        </div>
      ))}
    </section>
  );
};

const TopList: React.FC<{ title: string; list: TopEntry[]; kind: string }> = ({ title, list, kind }) => (
  <div>
    <p className="sub">{title}</p>
    {list.length === 0 ? (
      <p className="note">Noch keine Daten.</p>
    ) : (
      <Rows rows={list.map((e) => ({ key: kind === 'decade' ? decadeLabel(e.key) : e.key, count: e.count }))} />
    )}
  </div>
);

/** Labelled horizontal bars; with `total` the share is shown next to the count. */
const Rows: React.FC<{ rows: TopEntry[]; total?: number }> = ({ rows, total }) => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ol className="rows">
      {rows.map((r) => (
        <li key={r.key}>
          <span className="row-label">{r.key}</span>
          <span className="row-track">
            <span style={{ width: `${(r.count / max) * 100}%` }} />
          </span>
          <span className="row-value">
            {r.count.toLocaleString('de-DE')}
            {total ? ` · ${Math.round((r.count / total) * 100)} %` : ''}
          </span>
        </li>
      ))}
    </ol>
  );
};

const Tile: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="tile">
    <strong>{value.toLocaleString('de-DE')}</strong>
    <span>{label}</span>
  </div>
);

// ---------------------------------------------------------------- Feedback

const STATUS_LABELS: Record<FeedbackEntry['status'], string> = {
  offen: 'Offen',
  übernommen: 'Als To Do übernommen',
  erledigt: 'Erledigt',
};

const FeedbackTab: React.FC<{ api: Api }> = ({ api }) => {
  const [load, setLoad] = useState<Load<{ configured: boolean; entries: FeedbackEntry[] }>>({ state: 'loading' });
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoad({ state: 'loading' });
    setLoad(await api<{ configured: boolean; entries: FeedbackEntry[] }>(`${MAIN_API}/api/admin?view=feedback`));
  }, [api]);
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const act = async (id: string, action: 'accept' | 'done') => {
    setBusy(id);
    setFailed(null);
    const result = await api<{ status: FeedbackEntry['status'] }>(`${MAIN_API}/api/admin`, {
      method: 'POST',
      body: JSON.stringify({ id, action }),
    });
    setBusy(null);
    if (result.state !== 'ready') return setFailed(id);
    setLoad((prev) =>
      prev.state === 'ready'
        ? {
            state: 'ready',
            data: {
              ...prev.data,
              entries: prev.data.entries.map((e) => (e.id === id ? { ...e, status: result.data.status } : e)),
            },
          }
        : prev,
    );
  };

  if (load.state !== 'ready') return <Problem load={load} onRetry={fetchFeedback} />;
  if (!load.data.configured)
    return (
      <section className="card">
        <p>Feedback-Speicher ist nicht eingerichtet (FEEDBACK_GITHUB_TOKEN fehlt in Vercel).</p>
      </section>
    );

  const open = load.data.entries.filter((e) => e.status === 'offen');
  const list = showAll ? load.data.entries : open;
  return (
    <>
      <div className="toolbar">
        <span className="who">
          {open.length} offen · {load.data.entries.length} insgesamt
        </span>
        <button className="btn small" aria-pressed={showAll} onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Nur offene' : 'Alle zeigen'}
        </button>
      </div>
      {list.length === 0 && (
        <section className="card">
          <p>{showAll ? 'Noch kein Feedback.' : 'Kein offenes Feedback. 🎉'}</p>
        </section>
      )}
      {list.map((e) => (
        <section key={e.id} className="card feedback">
          <p className="eyebrow">
            {e.categoryLabel} · {fmtDay(e.date)} · <span className={`status ${e.status}`}>{STATUS_LABELS[e.status]}</span>
          </p>
          <p className="feedback-text">{e.text}</p>
          {e.status === 'offen' && (
            <div className="actions">
              <button className="btn small" disabled={busy === e.id} onClick={() => act(e.id, 'accept')}>
                Als To Do übernehmen
              </button>
              <button className="btn small" disabled={busy === e.id} onClick={() => act(e.id, 'done')}>
                Erledigt
              </button>
            </div>
          )}
          {failed === e.id && <p className="note">Hat nicht geklappt. Bitte noch einmal versuchen.</p>}
        </section>
      ))}
      <p className="note">
        „Als To Do übernehmen“ schreibt den Punkt in die README. Das löst wie jede Code-Änderung neue Builds in Vercel aus.
        „Erledigt“ ändert nur feedback.md und kostet keinen Build.
      </p>
    </>
  );
};

// ---------------------------------------------------------------- Live-Check

const STATE_TEXT: Record<LiveDomain['state'], string> = {
  current: '✓ Aktuell',
  stale: '⚠ Veraltet',
  unknown: '? Version unbekannt',
  unreachable: '✕ Nicht erreichbar',
};

const LiveTab: React.FC<{ api: Api }> = ({ api }) => {
  const [load, setLoad] = useState<Load<Live>>({ state: 'loading' });
  const fetchLive = useCallback(async () => {
    setLoad({ state: 'loading' });
    setLoad(await api<Live>(`${MAIN_API}/api/admin?view=live`));
  }, [api]);
  useEffect(() => {
    fetchLive();
  }, [fetchLive]);

  if (load.state !== 'ready') return <Problem load={load} onRetry={fetchLive} />;
  const { master, domains } = load.data;
  return (
    <>
      <section className="card">
        <p className="eyebrow">Neuester Stand im Code (master)</p>
        <p>
          <code>{master.sha.slice(0, 7)}</code> · {master.message}
        </p>
        <p className="note">{master.date ? fmtDay(master.date) : ''}</p>
      </section>
      {domains.map((d) => (
        <section key={d.id} className="card">
          <h2>{d.label}</h2>
          <p className={`live ${d.state}`}>{STATE_TEXT[d.state]}</p>
          <p className="note">
            {d.url.replace('https://', '')} liefert{' '}
            {d.sha ? <code>{d.sha.slice(0, 7)}</code> : 'keine Versionsangabe'} aus
            {d.state === 'stale' && d.behind > 0 ? `, ${d.behind} ${d.behind === 1 ? 'Commit' : 'Commits'} hinter master` : ''}.
          </p>
          {d.state === 'stale' && (
            <p>
              Hier fehlt eine neuere Version.{' '}
              <a href={`https://vercel.com/marco-schlude-s-projects/${d.project}/deployments`} target="_blank" rel="noreferrer">
                In Vercel neu deployen
              </a>{' '}
              (beim obersten Eintrag ⋯ → Redeploy). Wenn gerade erst gemergt wurde, kann der Build auch noch laufen.
            </p>
          )}
        </section>
      ))}
      <button className="btn" onClick={fetchLive}>
        Neu prüfen
      </button>
    </>
  );
};
