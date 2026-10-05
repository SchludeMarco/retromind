import React, { useEffect, useState } from 'react';
import { submitFeedback, FeedbackCategory } from '../../services/feedbackService';

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'lob', label: 'LOB' },
  { value: 'tadel', label: 'TADEL' },
  { value: 'vorschlag', label: 'VORSCHLAG' },
  { value: 'wunsch', label: 'WUNSCH' },
  { value: 'sonstiges', label: 'SONSTIGES' },
];

// Feedback from the Gaming edition. Same channel as the main app (mail to
// Marco + feedback.md), marked "(Gaming)" so it is clear where it came from.
export const Feedback: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [category, setCategory] = useState<FeedbackCategory>('lob');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || status === 'sending') return;
    setStatus('sending');
    try {
      await submitFeedback(category, text, contactEmail.trim() || undefined, 'gaming');
      setStatus('sent');
    } catch (err) {
      setError((err as { message?: string })?.message || 'Das Feedback konnte nicht gesendet werden.');
      setStatus('error');
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Feedback geben"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font">✉ FEEDBACK</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
          ✕
        </button>

        {status === 'sent' ? (
          <section>
            <p className="pixel-font cloud-user">DANKE FÜR DEIN FEEDBACK!</p>
            <p>Deine Nachricht ist angekommen.</p>
            <button className="px-btn" onClick={onClose} data-nav>
              WEITER ZOCKEN
            </button>
          </section>
        ) : (
          <form className="feedback-form" onSubmit={send}>
            <p>Lob, Tadel, Vorschläge oder Wünsche zur App? Raus damit.</p>
            <div className="settings-row" role="group" aria-label="Art des Feedbacks">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className="px-btn"
                  aria-pressed={category === c.value}
                  onClick={() => setCategory(c.value)}
                  data-nav
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label htmlFor="gm-feedback-message" className="pixel-font">
              DEINE NACHRICHT
            </label>
            <textarea
              id="gm-feedback-message"
              rows={5}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <label htmlFor="gm-feedback-email" className="pixel-font">
              E-MAIL FÜR RÜCKFRAGEN (FREIWILLIG)
            </label>
            <input
              id="gm-feedback-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <p className="dim">
              Deine Nachricht wird ohne E-Mail-Adresse in unserer öffentlichen Feedback-Liste gespeichert.
            </p>
            {status === 'error' && <p role="alert">⚠ {error}</p>}
            <button className="px-btn big" type="submit" disabled={!message.trim() || status === 'sending'} data-nav>
              {status === 'sending' ? 'WIRD GESENDET …' : 'FEEDBACK ABSENDEN'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
