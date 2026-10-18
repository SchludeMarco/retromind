import React, { useCallback, useEffect, useState } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { warmUpGoogle } from '../lib/googleAuth';
import { isAdminUser } from '../lib/admin';
import { LOCALE, isGerman, tr } from '../lib/i18n';

// Admin area (/admin/), only for Marco: usage numbers (api/stats.js), the
// feedback inbox and a live check of both domains (api/admin.js). Every API
// checks the Google token with Google, so this page holds no secret and shows
// nothing to anyone else.

type AppId = 'zeitreise' | 'gaming';
type Tab = 'usage' | 'guests' | 'feedback' | 'live';
interface Day {
  day: string;
  starts: number;
  visitors: number;
  /** Starts by someone who was here on an earlier day (since 2026-10-18). */
  returning?: number;
}
interface TopEntry {
  key: string;
  count: number;
}
interface AppStatsData {
  totalStarts: number;
  daily: Day[];
  devices: { phone: number; tablet: number; desktop: number; installed: number };
  /** How long ago each start's device had last opened the app (lib/visits.ts). */
  back?: Record<'first' | 'same' | 'day' | 'week' | 'month' | 'later', number>;
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

const APP_LABELS: Record<AppId, string> = { zeitreise: tr('Time Travel', 'Zeitreise'), gaming: 'Gaming' };
const TOP_LABELS: Record<string, string> = {
  decade: tr('Most explored decades', 'Meist erkundete Jahrzehnte'),
  game: tr('Most opened games', 'Meist geöffnete Spiele'),
  minigame: tr('Most played minigames', 'Meist gespielte Minispiele'),
};
const RANGES = [7, 30, 90];
const TABS: { id: Tab; label: string }[] = [
  { id: 'usage', label: tr('Usage', 'Nutzung') },
  { id: 'guests', label: tr('Guests', 'Gäste') },
  { id: 'feedback', label: 'Feedback' },
  { id: 'live', label: tr('Live check', 'Live-Check') },
];
// Feedback and the live check need the GitHub token, which only the main
// project has; on the Gaming domain the page asks the main domain for them.
const MAIN_API =
  typeof window !== 'undefined' && window.location.hostname === 'retromind-gaming.vercel.app'
    ? 'https://retromind.vercel.app'
    : '';

const fmtDay = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return isGerman ? `${d}.${m}.${y}` : `${m}/${d}/${y}`;
};
const fmtMonth = (ym?: string) => {
  if (!ym) return tr('this month', 'diesen Monat');
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
};
const sum = (days: Day[], key: 'starts' | 'visitors' | 'returning') => days.reduce((n, d) => n + (d[key] ?? 0), 0);
const decadeLabel = (key: string) => (/^\d{4}$/.test(key) ? tr(`${key}s`, `${key}er`) : key);

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
          <p className="eyebrow">{tr('RetroMind · operator only', 'RetroMind · nur für den Betreiber')}</p>
          <h1>{tr('Admin area', 'Adminbereich')}</h1>
        </div>
        <a className="btn ghost" href="/">
          {tr('← Back to the app', '← Zur App')}
        </a>
      </header>

      {auth.status === 'not_configured' && <p className="note">{tr('Google sign-in isn’t set up on this page.', 'Google-Anmeldung ist auf dieser Seite nicht eingerichtet.')}</p>}

      {!signedIn && auth.status !== 'not_configured' && (
        <section className="card">
          <p>
            {tr(
              'Sign in with your Google account. Only the operator’s account can see the numbers.',
              'Melde dich mit deinem Google-Konto an. Zahlen sieht nur das Konto des Betreibers.'
            )}
          </p>
          <button
            className="btn"
            onClick={auth.signIn}
            onPointerEnter={warmUpGoogle}
            onPointerDown={warmUpGoogle}
            onFocus={warmUpGoogle}
            disabled={auth.status === 'signing_in'}
          >
            {auth.status === 'signing_in' ? tr('Signing in …', 'Anmeldung läuft …') : tr('Sign in with Google', 'Mit Google anmelden')}
          </button>
          {auth.status === 'error' && <p className="note">{tr('Sign-in didn’t work. Please try again.', 'Die Anmeldung hat nicht geklappt. Bitte noch einmal.')}</p>}
        </section>
      )}

      {signedIn && (
        <>
          <p className="who">
            {tr('Signed in as', 'Angemeldet als')} {auth.user?.email}
            <button className="link" onClick={auth.signOut}>
              {tr('Sign out', 'Abmelden')}
            </button>
          </p>
          <nav className="tabs" role="tablist" aria-label={tr('Sections', 'Bereiche')}>
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className="btn small" onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          {tab === 'usage' && <UsageTab api={api} isAdmin={isAdminUser(auth.user)} />}
          {tab === 'guests' && <GuestsTab api={api} />}
          {tab === 'feedback' && <FeedbackTab api={api} />}
          {tab === 'live' && <LiveTab api={api} />}
        </>
      )}
    </main>
  );
};

type Api = <T>(url: string, init?: RequestInit) => Promise<Load<T>>;

const Problem: React.FC<{ load: Load<unknown>; onRetry: () => void; isAdmin?: boolean }> = ({ load, onRetry, isAdmin }) => {
  if (load.state === 'loading') return <p className="note">{tr('Loading …', 'Wird geladen …')}</p>;
  if (load.state === 'forbidden')
    return (
      <section className="card">
        <p>{tr('This Google account doesn’t have access to the admin area.', 'Dieses Google-Konto hat keinen Zugang zum Adminbereich.')}</p>
        {isAdmin && <p className="note">{tr('Please sign out and back in.', 'Bitte ab- und wieder anmelden.')}</p>}
      </section>
    );
  if (load.state === 'error')
    return (
      <section className="card">
        <p>{tr('That couldn’t be loaded.', 'Das konnte nicht geladen werden.')}</p>
        <button className="btn" onClick={onRetry}>
          {tr('Try again', 'Noch einmal')}
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
      <div className="ranges" role="radiogroup" aria-label={tr('Time range', 'Zeitraum')}>
        {RANGES.map((n) => (
          <button key={n} role="radio" aria-checked={range === n} className="btn small" onClick={() => setRange(n)}>
            {tr(`${n} days`, `${n} Tage`)}
          </button>
        ))}
      </div>
      <Problem load={load} onRetry={fetchStats} isAdmin={isAdmin} />
      {load.state === 'ready' && !load.data.configured && (
        <section className="card">
          <p>
            {tr(
              <>
                <strong>The counter has no storage yet.</strong> In Vercel under Storage, create a free Upstash Redis database,
                connect it to both projects (retromind and retromind-gaming), then redeploy.
              </>,
              <>
                <strong>Der Zähler hat noch keinen Speicher.</strong> In Vercel unter Storage eine kostenlose Upstash-Redis-Datenbank
                anlegen und mit beiden Projekten (retromind und retromind-gaming) verbinden, danach neu deployen.
              </>
            )}
          </p>
        </section>
      )}
      {load.state === 'ready' && load.data.configured && load.data.apps && (
        <>
          {(Object.keys(APP_LABELS) as AppId[]).map((app) => (
            <AppStats key={app} label={APP_LABELS[app]} data={load.data.apps![app]} month={load.data.month} />
          ))}
          <p className="note">
            {tr(
              <>
                Counted anonymously{load.data.since ? ` since ${fmtDay(load.data.since)}` : ''}: no cookies and no stored IP
                addresses. A visitor counts once per day and app. Anyone who comes back on several days counts again on each day, so
                totals across several days are “visits,” not distinct people. Devices count per app start, favorites once per visit
                and entry; devices and favorites have been tracked since 10/08/2026.
              </>,
              <>
                Gezählt wird anonym{load.data.since ? ` seit ${fmtDay(load.data.since)}` : ''}: ohne Cookies und ohne gespeicherte
                IP-Adressen. Ein Besucher zählt einmal pro Tag und App. Wer an mehreren Tagen kommt, zählt an jedem Tag neu, deshalb
                sind die Summen über mehrere Tage „Besuche“, keine verschiedenen Personen. Geräte zählen pro App-Start, Beliebtes
                einmal pro Besuch und Eintrag; Geräte und Beliebtes gibt es seit dem 08.10.2026.
              </>
            )}
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
        <Tile value={today?.visitors ?? 0} label={tr('Visitors today', 'Besucher heute')} />
        <Tile value={sum(last7, 'visitors')} label={tr('Visits, 7 days', 'Besuche, 7 Tage')} />
        <Tile value={sum(days, 'visitors')} label={tr(`Visits, ${days.length} days`, `Besuche, ${days.length} Tage`)} />
        <Tile value={data.totalStarts} label={tr('Total app starts', 'App-Starts gesamt')} />
      </div>

      <div className="chart-head">
        <span>{tr('Visitors per day', 'Besucher pro Tag')}</span>
        <span className="readout" aria-live="polite">
          {shown
            ? tr(
                `${fmtDay(shown.day)}: ${shown.visitors} visitors, ${shown.starts} starts`,
                `${fmtDay(shown.day)}: ${shown.visitors} Besucher, ${shown.starts} Starts`
              )
            : tr(`max. ${max} in one day`, `max. ${max} an einem Tag`)}
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
            aria-label={tr(
              `${fmtDay(d.day)}: ${d.visitors} visitors, ${d.starts} starts`,
              `${fmtDay(d.day)}: ${d.visitors} Besucher, ${d.starts} Starts`
            )}
          >
            <span style={{ height: `${(d.visitors / max) * 100}%` }} />
          </button>
        ))}
      </div>
      <div className="axis">
        <span>{fmtDay(days[0].day)}</span>
        <span>{tr('today', 'heute')}</span>
      </div>

      <details>
        <summary>{tr('As a table', 'Als Tabelle')}</summary>
        <table>
          <thead>
            <tr>
              <th>{tr('Day', 'Tag')}</th>
              <th>{tr('Visitors', 'Besucher')}</th>
              <th>{tr('App starts', 'App-Starts')}</th>
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

      <h3>{tr(`Devices, ${days.length} days`, `Geräte, ${days.length} Tage`)}</h3>
      {devTotal === 0 ? (
        <p className="note">Noch keine Daten.</p>
      ) : (
        <>
          <Rows
            rows={[
              { key: tr('Phone', 'Handy'), count: dev.phone },
              { key: 'Tablet', count: dev.tablet },
              { key: 'Computer', count: dev.desktop },
            ]}
            total={devTotal}
          />
          <p className="note">
            {tr(
              `Opened as an installed app: ${dev.installed.toLocaleString(LOCALE)} of ${devTotal.toLocaleString(LOCALE)} starts (${Math.round((dev.installed / devTotal) * 100)}%).`,
              `Davon als App installiert geöffnet: ${dev.installed.toLocaleString(LOCALE)} von ${devTotal.toLocaleString(LOCALE)} Starts (${Math.round((dev.installed / devTotal) * 100)} %).`
            )}
          </p>
        </>
      )}

      <ComeBack back={data.back} days={days} />

      {Object.entries(data.top).map(([kind, lists]) => (
        <div key={kind}>
          <h3>{TOP_LABELS[kind] ?? kind}</h3>
          <div className="top-grid">
            <TopList title={fmtMonth(month)} list={lists.month} kind={kind} />
            <TopList title={tr('All time', 'Insgesamt')} list={lists.all} kind={kind} />
          </div>
        </div>
      ))}
    </section>
  );
};

// Do people come back? Each app start says how long ago that device last
// opened the app (lib/visits.ts), so this shows returns without knowing who.
const ComeBack: React.FC<{ back?: AppStatsData['back']; days: Day[] }> = ({ back, days }) => {
  const total = back ? Object.values(back).reduce((a, b) => a + b, 0) : 0;
  const returning = back ? back.day + back.week + back.month + back.later : 0;
  return (
    <>
      <h3>{tr(`Coming back, ${days.length} days`, `Wiederkommen, ${days.length} Tage`)}</h3>
      {!back || total === 0 ? (
        <p className="note">{tr('No data yet (counted since 10/18/2026).', 'Noch keine Daten (gezählt seit 18.10.2026).')}</p>
      ) : (
        <>
          <Rows
            rows={[
              { key: tr('First visit on this device', 'Erster Besuch auf dem Gerät'), count: back.first },
              { key: tr('Again the same day', 'Am selben Tag nochmal'), count: back.same },
              { key: tr('Back after 1 day', 'Zurück nach 1 Tag'), count: back.day },
              { key: tr('Back after 2–7 days', 'Zurück nach 2–7 Tagen'), count: back.week },
              { key: tr('Back after 8–31 days', 'Zurück nach 8–31 Tagen'), count: back.month },
              { key: tr('Back after more than a month', 'Zurück nach über einem Monat'), count: back.later },
            ]}
            total={total}
          />
          <p className="note">
            {tr(
              `${returning.toLocaleString(LOCALE)} starts came from devices that had been here on an earlier day; last 7 days: ${sum(days.slice(-7), 'returning').toLocaleString(LOCALE)}.`,
              `${returning.toLocaleString(LOCALE)} Starts kamen von Geräten, die an einem früheren Tag schon hier waren; letzte 7 Tage: ${sum(days.slice(-7), 'returning').toLocaleString(LOCALE)}.`
            )}
          </p>
        </>
      )}
    </>
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
            {r.count.toLocaleString(LOCALE)}
            {total ? ` · ${Math.round((r.count / total) * 100)}${tr('', ' ')}%` : ''}
          </span>
        </li>
      ))}
    </ol>
  );
};

const Tile: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="tile">
    <strong>{value.toLocaleString(LOCALE)}</strong>
    <span>{label}</span>
  </div>
);

// ---------------------------------------------------------------- Feedback

const STATUS_LABELS: Record<FeedbackEntry['status'], string> = {
  offen: tr('Open', 'Offen'),
  übernommen: tr('Added as a To Do', 'Als To Do übernommen'),
  erledigt: tr('Done', 'Erledigt'),
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
        <p>
          {tr(
            'Feedback storage isn’t set up (FEEDBACK_GITHUB_TOKEN is missing in Vercel).',
            'Feedback-Speicher ist nicht eingerichtet (FEEDBACK_GITHUB_TOKEN fehlt in Vercel).'
          )}
        </p>
      </section>
    );

  const open = load.data.entries.filter((e) => e.status === 'offen');
  const list = showAll ? load.data.entries : open;
  return (
    <>
      <div className="toolbar">
        <span className="who">
          {tr(
            `${open.length} open · ${load.data.entries.length} total`,
            `${open.length} offen · ${load.data.entries.length} insgesamt`
          )}
        </span>
        <button className="btn small" aria-pressed={showAll} onClick={() => setShowAll((v) => !v)}>
          {showAll ? tr('Open only', 'Nur offene') : tr('Show all', 'Alle zeigen')}
        </button>
      </div>
      {list.length === 0 && (
        <section className="card">
          <p>{showAll ? tr('No feedback yet.', 'Noch kein Feedback.') : tr('No open feedback. 🎉', 'Kein offenes Feedback. 🎉')}</p>
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
                {tr('Add as To Do', 'Als To Do übernehmen')}
              </button>
              <button className="btn small" disabled={busy === e.id} onClick={() => act(e.id, 'done')}>
                {tr('Done', 'Erledigt')}
              </button>
            </div>
          )}
          {failed === e.id && <p className="note">{tr('That didn’t work. Please try again.', 'Hat nicht geklappt. Bitte noch einmal versuchen.')}</p>}
        </section>
      ))}
      <p className="note">
        {tr(
          '“Add as To Do” writes the item into the README. Like any code change, that triggers new builds in Vercel. “Done” only changes feedback.md and doesn’t cost a build.',
          '„Als To Do übernehmen“ schreibt den Punkt in die README. Das löst wie jede Code-Änderung neue Builds in Vercel aus. „Erledigt“ ändert nur feedback.md und kostet keinen Build.'
        )}
      </p>
    </>
  );
};

// ---------------------------------------------------------------- Gäste

// "Nur für Eingeladene": who may open RetroMind (middleware.js, api/_guests.js).
// The list lives in the shared database, so it applies to both domains.
const GuestsTab: React.FC<{ api: Api }> = ({ api }) => {
  type Guests = { configured: boolean; guests: string[]; admin: string };
  const [load, setLoad] = useState<Load<Guests>>({ state: 'loading' });
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const fetchGuests = useCallback(async () => {
    setLoad({ state: 'loading' });
    setLoad(await api<Guests>('/api/admin?view=guests'));
  }, [api]);
  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const change = async (action: 'guestAdd' | 'guestRemove', who: string) => {
    if (action === 'guestRemove' && !window.confirm(tr(`Remove ${who} from the guest list?`, `${who} von der Gästeliste nehmen?`))) return;
    setBusy(true);
    setFailed(false);
    const result = await api<{ guests: string[] }>('/api/admin', { method: 'POST', body: JSON.stringify({ action, email: who }) });
    setBusy(false);
    if (result.state !== 'ready') return setFailed(true);
    if (action === 'guestAdd') setEmail('');
    setLoad((prev) => (prev.state === 'ready' ? { state: 'ready', data: { ...prev.data, guests: result.data.guests } } : prev));
  };

  if (load.state !== 'ready') return <Problem load={load} onRetry={fetchGuests} />;
  if (!load.data.configured)
    return (
      <section className="card">
        <p>
          {tr(
            'The guest list needs the Upstash database (see Usage). Until it is connected, RetroMind stays open for everyone.',
            'Die Gästeliste braucht die Upstash-Datenbank (siehe Nutzung). Solange sie fehlt, ist RetroMind für alle offen.'
          )}
        </p>
      </section>
    );
  const { guests, admin } = load.data;
  return (
    <>
      <section className="card">
        <p>
          {tr(
            'RetroMind only opens for these Google accounts (both domains). Guests sign in once with Google and stay in for 30 days after their last visit. Removing someone takes effect within a day.',
            'RetroMind öffnet sich nur für diese Google-Konten (beide Domains). Gäste melden sich einmal mit Google an und bleiben bis 30 Tage nach ihrem letzten Besuch drin. Wer von der Liste fliegt, ist spätestens nach einem Tag draußen.'
          )}
        </p>
        <form
          className="actions"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) change('guestAdd', email.trim());
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tr('name@gmail.com', 'name@gmail.com')}
            aria-label={tr('Google address of the guest', 'Google-Adresse des Gasts')}
            style={{ flex: 1, minWidth: 0, padding: '8px 10px', font: 'inherit', borderRadius: 8, border: '1px solid currentColor', background: 'transparent', color: 'inherit' }}
          />
          <button className="btn small" type="submit" disabled={busy}>
            {tr('Invite', 'Einladen')}
          </button>
        </form>
        {failed && <p className="note">{tr('That didn’t work. Please check the address and try again.', 'Hat nicht geklappt. Bitte Adresse prüfen und noch einmal versuchen.')}</p>}
      </section>
      <section className="card">
        <p className="eyebrow">{tr(`${guests.length + 1} with access`, `${guests.length + 1} mit Zugang`)}</p>
        <ul className="guest-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ padding: '6px 0' }}>
            {admin} <span className="note">· {tr('you, always', 'du, immer')}</span>
          </li>
          {guests
            .filter((g) => g !== admin)
            .map((g) => (
              <li key={g} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 0' }}>
                <span style={{ overflowWrap: 'anywhere' }}>{g}</span>
                <button className="btn small" disabled={busy} onClick={() => change('guestRemove', g)}>
                  {tr('Remove', 'Entfernen')}
                </button>
              </li>
            ))}
        </ul>
        <p className="note">
          {tr(
            'Send your guests the link to RetroMind; they land on the guest page and sign in with exactly this Google address.',
            'Schick deinen Gästen einfach den Link zu RetroMind; sie landen auf der Gästeseite und melden sich mit genau dieser Google-Adresse an.'
          )}
        </p>
      </section>
    </>
  );
};

// ---------------------------------------------------------------- Live-Check

const STATE_TEXT: Record<LiveDomain['state'], string> = {
  current: tr('✓ Up to date', '✓ Aktuell'),
  stale: tr('⚠ Outdated', '⚠ Veraltet'),
  unknown: tr('? Version unknown', '? Version unbekannt'),
  unreachable: tr('✕ Unreachable', '✕ Nicht erreichbar'),
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
        <p className="eyebrow">{tr('Latest code (master)', 'Neuester Stand im Code (master)')}</p>
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
            {d.url.replace('https://', '')} {tr('serves', 'liefert')}{' '}
            {d.sha ? <code>{d.sha.slice(0, 7)}</code> : tr('no version info', 'keine Versionsangabe')}
            {tr('', ' aus')}
            {d.state === 'stale' && d.behind > 0
              ? tr(
                  `, ${d.behind} ${d.behind === 1 ? 'commit' : 'commits'} behind master`,
                  `, ${d.behind} ${d.behind === 1 ? 'Commit' : 'Commits'} hinter master`
                )
              : ''}
            .
          </p>
          {d.state === 'stale' && (
            <p>
              {tr('A newer version is missing here.', 'Hier fehlt eine neuere Version.')}{' '}
              <a href={`https://vercel.com/marco-schlude-s-projects/${d.project}/deployments`} target="_blank" rel="noreferrer">
                {tr('Redeploy in Vercel', 'In Vercel neu deployen')}
              </a>{' '}
              {tr(
                '(on the top entry ⋯ → Redeploy). If something was just merged, the build may still be running.',
                '(beim obersten Eintrag ⋯ → Redeploy). Wenn gerade erst gemergt wurde, kann der Build auch noch laufen.'
              )}
            </p>
          )}
        </section>
      ))}
      <button className="btn" onClick={fetchLive}>
        {tr('Check again', 'Neu prüfen')}
      </button>
    </>
  );
};
