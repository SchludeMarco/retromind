import React, { useEffect, useState } from 'react';
import { submitFeedback, FeedbackCategory } from '../../services/feedbackService';
import { tr } from '../../lib/i18n';

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'lob', label: tr('PRAISE', 'LOB') },
  { value: 'tadel', label: tr('CRITICISM', 'TADEL') },
  { value: 'vorschlag', label: tr('SUGGESTION', 'VORSCHLAG') },
  { value: 'wunsch', label: tr('WISH', 'WUNSCH') },
  { value: 'sonstiges', label: tr('OTHER', 'SONSTIGES') },
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
      setError((err as { message?: string })?.message || tr('Your feedback couldn’t be sent.', 'Das Feedback konnte nicht gesendet werden.'));
      setStatus('error');
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={tr('Send feedback', 'Feedback geben')}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font">✉ FEEDBACK</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>

        {status === 'sent' ? (
          <section>
            <p className="pixel-font cloud-user">{tr('THANKS FOR YOUR FEEDBACK!', 'DANKE FÜR DEIN FEEDBACK!')}</p>
            <p>{tr('Your message got through.', 'Deine Nachricht ist angekommen.')}</p>
            <button className="px-btn" onClick={onClose} data-nav>
              {tr('KEEP PLAYING', 'WEITER ZOCKEN')}
            </button>
          </section>
        ) : (
          <form className="feedback-form" onSubmit={send}>
            <p>{tr('Praise, gripes, suggestions or wishes for the app? Let’s hear it.', 'Lob, Tadel, Vorschläge oder Wünsche zur App? Raus damit.')}</p>
            <div className="settings-row" role="group" aria-label={tr('Type of feedback', 'Art des Feedbacks')}>
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
              {tr('YOUR MESSAGE', 'DEINE NACHRICHT')}
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
              {tr('EMAIL FOR FOLLOW-UP QUESTIONS (OPTIONAL)', 'E-MAIL FÜR RÜCKFRAGEN (FREIWILLIG)')}
            </label>
            <input
              id="gm-feedback-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <p className="dim">
              {tr('Your message is saved without your email address in our public feedback list.', 'Deine Nachricht wird ohne E-Mail-Adresse in unserer öffentlichen Feedback-Liste gespeichert.')}
            </p>
            {status === 'error' && <p role="alert">⚠ {error}</p>}
            <button className="px-btn big" type="submit" disabled={!message.trim() || status === 'sending'} data-nav>
              {status === 'sending' ? tr('SENDING …', 'WIRD GESENDET …') : tr('SEND FEEDBACK', 'FEEDBACK ABSENDEN')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
