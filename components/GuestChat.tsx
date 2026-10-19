import React, { useCallback, useEffect, useRef, useState } from 'react';
import { tr, getLang } from '../lib/i18n';
import {
  ChatMessage,
  ROOM,
  deleteMessage,
  joinChat,
  leaveChat,
  loadMessages,
  markRead,
  refreshInbox,
  sendMessage,
  unreadIn,
  useChatInbox,
  useReadMarks,
} from '../lib/chat';
import { PushState, topicOff, topicOn, topicState } from '../lib/push';
import './guestChat.css';

// The chat corner of both apps (Marco, 2026-10-19: "Ich möchte einen Chat
// zwischen Usern ermöglichen"): invited guests write to each other, all
// together in one room or person to person. Opened from the controls behind
// the handle at the right edge (components/ControlHandle.tsx,
// gaming/components/ControlHandle.tsx) or from a push message. Joining asks
// for a name first and says what is stored (api/_chat.js).

const POLL_MS = 4000;

function when(at: number): string {
  const d = new Date(at);
  const locale = getLang() === 'de' ? 'de-DE' : 'en-US';
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}, ${time}`;
}

export const GuestChat: React.FC<{
  app: 'zeitreise' | 'gaming';
  open: boolean;
  onClose: () => void;
  /** A conversation to open right away (from a push message), "all" for the room. */
  openWith?: string | null;
  /** A name to offer when joining (the Zeitreise knows the traveller's). */
  suggestedName?: string;
  onSound?: () => void;
}> = ({ app, open, onClose, openWith = null, suggestedName = '', onSound }) => {
  const inbox = useChatInbox(open);
  const marks = useReadMarks();
  const [withId, setWithId] = useState<string | null>(openWith);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && openWith) setWithId(openWith);
  }, [open, openWith]);

  useEffect(() => {
    if (!open) return;
    refreshInbox();
    // While the panel is open, the list of people and the new-message dots stay fresh too.
    const timer = window.setInterval(() => document.visibilityState === 'visible' && refreshInbox(), 10_000);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // The open conversation, asked again every few seconds while it is visible.
  const meId = inbox?.me?.id;
  const lastAt = messages.length ? messages[messages.length - 1].at : 0;
  const lastAtRef = useRef(0);
  lastAtRef.current = lastAt;
  useEffect(() => {
    if (!open || !withId || !meId) return;
    let alive = true;
    setMessages([]);
    lastAtRef.current = 0;
    const pull = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const fresh = await loadMessages(withId, lastAtRef.current);
        if (!alive || !fresh.length) return;
        setMessages((m) => {
          const known = new Set(m.map((x) => x.id));
          return [...m, ...fresh.filter((x) => !known.has(x.id))];
        });
      } catch {
        /* offline for a moment: the next round tries again */
      }
    };
    pull();
    const timer = window.setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [open, withId, meId]);

  useEffect(() => {
    if (open && withId && lastAt) markRead(withId, Math.max(lastAt, inbox?.last[withId] || 0));
  }, [open, withId, lastAt, inbox?.last]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages.length, withId]);

  useEffect(() => {
    if (withId) inputRef.current?.focus({ preventScroll: true });
    setNote('');
  }, [withId]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !withId) return;
    onSound?.();
    setBusy(true);
    setNote('');
    try {
      const msg = await sendMessage(withId, text);
      setMessages((m) => [...m, msg]);
      setInput('');
    } catch (e) {
      const code = (e as { code?: string }).code;
      setNote(
        code === 'slow_down'
          ? tr('That was a lot at once. Wait a minute, then write again.', 'Das war viel auf einmal. Warte eine Minute, dann schreib weiter.')
          : code === 'unknown_person'
            ? tr('This person has left the chat.', 'Diese Person hat den Chat verlassen.')
            : tr('Not sent: the connection is acting up. Please try again.', 'Nicht gesendet: Die Verbindung klemmt. Versuch es bitte noch einmal.')
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m: ChatMessage) => {
    if (!withId || !window.confirm(tr('Delete this message for everyone?', 'Diese Nachricht für alle löschen?'))) return;
    try {
      await deleteMessage(withId, m.id);
      setMessages((list) => list.filter((x) => x.id !== m.id));
    } catch {
      setNote(tr('Couldn’t delete it right now.', 'Konnte sie gerade nicht löschen.'));
    }
  };

  if (!open) return null;

  const me = inbox?.me ?? null;
  const unread = new Set(unreadIn(inbox, marks));
  const person = withId && withId !== ROOM ? inbox?.people.find((p) => p.id === withId) : null;
  const title = !withId || !me ? tr('Chat corner', 'Plauderecke') : withId === ROOM ? tr('Everyone', 'Alle zusammen') : person?.name ?? '…';

  return (
    <div className={`rm-chat rm-fixed no-print is-${app}`}>
      <div className="rm-chat-panel" role="dialog" aria-label={tr('Chat with other guests', 'Chat mit anderen Gästen')}>
        <div className="rm-chat-head">
          {withId && me ? (
            <button type="button" onClick={() => { onSound?.(); setWithId(null); }} aria-label={tr('Back to all chats', 'Zurück zu allen Chats')}>
              ←
            </button>
          ) : (
            <span aria-hidden="true">💬</span>
          )}
          <b className="rm-chat-title">{title}</b>
          <button type="button" onClick={() => { onSound?.(); onClose(); }} aria-label={tr('Close chat', 'Chat schließen')}>
            ✕
          </button>
        </div>

        {!inbox ? (
          <p className="rm-chat-pad rm-chat-dim">{tr('Opening the chat…', 'Der Chat öffnet…')}</p>
        ) : !inbox.ready ? (
          <p className="rm-chat-pad rm-chat-dim">
            {tr(
              'The chat isn’t available here right now. It works in the app for invited guests.',
              'Der Chat ist hier gerade nicht verfügbar. Er läuft in der App für eingeladene Gäste.'
            )}
          </p>
        ) : !me ? (
          <JoinForm suggestedName={suggestedName} onSound={onSound} />
        ) : withId ? (
          <>
            <div className="rm-chat-log" ref={logRef} aria-live="polite">
              {messages.length === 0 && (
                <p className="rm-chat-dim">
                  {withId === ROOM
                    ? tr('Nothing here yet. Say hello to everyone!', 'Noch ist es still hier. Sag allen Hallo!')
                    : tr('No messages yet. Write the first one.', 'Noch keine Nachrichten. Schreib die erste.')}
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`rm-chat-msg ${m.mine ? 'is-mine' : 'is-theirs'}`}>
                  <span className="rm-chat-meta">
                    {!m.mine && withId === ROOM && <b>{m.name} · </b>}
                    {when(m.at)}
                    {(m.mine || (me.admin && withId === ROOM)) && (
                      <button type="button" className="rm-chat-del" onClick={() => remove(m)} aria-label={tr('Delete message', 'Nachricht löschen')}>
                        ✕
                      </button>
                    )}
                  </span>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            {note && <p className="rm-chat-note" role="status">{note}</p>}
            <form
              className="rm-chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                maxLength={1000}
                placeholder={tr('Your message…', 'Deine Nachricht…')}
                aria-label={tr('Your message', 'Deine Nachricht')}
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label={tr('Send', 'Senden')}>
                ↑
              </button>
            </form>
          </>
        ) : (
          <div className="rm-chat-list">
            <ul>
              <li>
                <button type="button" onClick={() => { onSound?.(); setWithId(ROOM); }}>
                  <span aria-hidden="true">🛋️</span>
                  <span className="rm-chat-who">
                    <b>{tr('Everyone', 'Alle zusammen')}</b>
                    <small>{tr('The room for all guests', 'Der Raum für alle Gäste')}</small>
                  </span>
                  {unread.has(ROOM) && <span className="rm-chat-dot" aria-label={tr('new', 'neu')} />}
                </button>
              </li>
              {inbox.people.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => { onSound?.(); setWithId(p.id); }}>
                    <span aria-hidden="true">👤</span>
                    <span className="rm-chat-who">
                      <b>{p.name}</b>
                      <small>{tr('Just the two of you', 'Nur ihr zwei')}</small>
                    </span>
                    {unread.has(p.id) && <span className="rm-chat-dot" aria-label={tr('new', 'neu')} />}
                  </button>
                </li>
              ))}
            </ul>
            {inbox.people.length === 0 && (
              <p className="rm-chat-dim rm-chat-pad">
                {tr(
                  'Nobody else has joined yet. Once others join, you can write to them directly here.',
                  'Noch ist niemand sonst dabei. Sobald andere beitreten, kannst du ihnen hier direkt schreiben.'
                )}
              </p>
            )}
            <ChatFooter name={me.name} onSound={onSound} />
          </div>
        )}
      </div>
    </div>
  );
};

const JoinForm: React.FC<{ suggestedName: string; onSound?: () => void }> = ({ suggestedName, onSound }) => {
  const [name, setName] = useState(suggestedName.slice(0, 24));
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const join = async () => {
    if (busy || name.trim().length < 2 || !agree) return;
    onSound?.();
    setBusy(true);
    setError('');
    try {
      await joinChat(name.trim());
      const now = Date.now();
      const inbox = await refreshInbox();
      // Start fresh: what was written before you joined isn't "new".
      markRead(ROOM, now);
      inbox?.people.forEach((p) => markRead(p.id, now));
    } catch {
      setError(tr('That didn’t work. Please try again.', 'Das hat nicht geklappt. Versuch es bitte noch einmal.'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      className="rm-chat-join rm-chat-pad"
      onSubmit={(e) => {
        e.preventDefault();
        join();
      }}
    >
      <p>
        {tr(
          'Write with the other invited guests: all together in one room, or just the two of you.',
          'Schreib mit den anderen eingeladenen Gästen: alle zusammen in einem Raum oder nur ihr zwei.'
        )}
      </p>
      <label>
        <span>{tr('Your name in the chat', 'Dein Name im Chat')}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="nickname" />
      </label>
      <label className="rm-chat-agree">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          {tr(
            'I agree that my name and messages are stored on the RetroMind server for 30 days and shown to the guests I write to. I can delete my messages, or leave the chat with all of them, at any time.',
            'Ich bin einverstanden, dass mein Name und meine Nachrichten 30 Tage auf dem RetroMind-Server liegen und den Gästen gezeigt werden, denen ich schreibe. Ich kann meine Nachrichten jederzeit löschen oder den Chat samt allen verlassen.'
          )}{' '}
          <a href={getLang() === 'de' ? '/datenschutz.html' : '/privacy.html'} target="_blank" rel="noopener">
            {tr('Privacy', 'Datenschutz')}
          </a>
        </span>
      </label>
      {error && <p className="rm-chat-note">{error}</p>}
      <button type="submit" className="rm-chat-main-btn" disabled={busy || name.trim().length < 2 || !agree}>
        {busy ? '…' : tr('Join the chat', 'Dem Chat beitreten')}
      </button>
    </form>
  );
};

const ChatFooter: React.FC<{ name: string; onSound?: () => void }> = ({ name, onSound }) => {
  const [push, setPush] = useState<PushState | 'busy' | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(name);
  useEffect(() => {
    topicState('chat').then(setPush);
  }, []);
  const togglePush = useCallback(async () => {
    onSound?.();
    const was = push;
    setPush('busy');
    setPush(was === 'on' ? await topicOff('chat') : await topicOn('chat'));
  }, [push, onSound]);
  const leave = async () => {
    if (
      !window.confirm(
        tr(
          'Leave the chat? Your name, your messages and your conversations with others are deleted from the server.',
          'Den Chat verlassen? Dein Name, deine Nachrichten und deine Gespräche mit anderen werden vom Server gelöscht.'
        )
      )
    )
      return;
    onSound?.();
    await topicOff('chat').catch(() => {});
    await leaveChat();
    await refreshInbox();
  };
  return (
    <div className="rm-chat-foot">
      {renaming ? (
        <form
          className="rm-chat-rename"
          onSubmit={async (e) => {
            e.preventDefault();
            if (draft.trim().length < 2) return;
            await joinChat(draft.trim()).catch(() => {});
            await refreshInbox();
            setRenaming(false);
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={24} aria-label={tr('Your name in the chat', 'Dein Name im Chat')} />
          <button type="submit">{tr('Save', 'Speichern')}</button>
        </form>
      ) : (
        <p>
          {tr('You write as', 'Du schreibst als')} <b>{name}</b>{' '}
          <button type="button" className="rm-chat-link" onClick={() => setRenaming(true)}>
            {tr('change', 'ändern')}
          </button>
        </p>
      )}
      {push && push !== 'unsupported' && (
        <p>
          {push === 'install-first' ? (
            tr(
              'On iPhone and iPad, message alerts only work in the app on your home screen.',
              'Auf iPhone und iPad gehen Mitteilungen nur in der App auf dem Home-Bildschirm.'
            )
          ) : push === 'blocked' ? (
            tr('Notifications are blocked for this site in your browser settings.', 'Mitteilungen sind für diese Seite in den Browser-Einstellungen gesperrt.')
          ) : (
            <button type="button" className="rm-chat-link" onClick={togglePush} disabled={push === 'busy'} aria-pressed={push === 'on'}>
              {push === 'on'
                ? tr('🔔 Alerts for messages to you: on', '🔔 Mitteilung bei Nachrichten an dich: an')
                : push === 'busy'
                  ? '…'
                  : tr('🔕 Alerts for messages to you: off', '🔕 Mitteilung bei Nachrichten an dich: aus')}
            </button>
          )}
        </p>
      )}
      <p>
        <button type="button" className="rm-chat-link" onClick={leave}>
          {tr('Leave the chat', 'Chat verlassen')}
        </button>
      </p>
    </div>
  );
};
