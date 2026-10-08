import React, { useState } from 'react';
import { Modal } from './Modal';
import { submitFeedback, FeedbackCategory } from '../services/feedbackService';
import { tr } from '../lib/i18n';

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'lob', label: tr('Praise', 'Lob') },
  { value: 'tadel', label: tr('Criticism', 'Tadel') },
  { value: 'vorschlag', label: tr('Suggestion', 'Vorschlag') },
  { value: 'wunsch', label: tr('Wish', 'Wunsch') },
  { value: 'sonstiges', label: tr('Other', 'Sonstiges') },
];

const MAX_LENGTH = 4000;

export const FeedbackModal: React.FC<{
  onDismiss: () => void;
  onCloseClick: () => void;
}> = ({ onDismiss, onCloseClick }) => {
  const [category, setCategory] = useState<FeedbackCategory>('lob');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const trimmed = message.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_LENGTH && status !== 'sending';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('sending');
    setErrorMessage('');
    try {
      await submitFeedback(category, trimmed, contactEmail.trim() || undefined);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        (err as { message?: string })?.message || tr('Your feedback couldn’t be sent.', 'Das Feedback konnte nicht gesendet werden.')
      );
    }
  };

  return (
    <Modal onClose={onDismiss} label={tr('Give feedback', 'Feedback geben')}>
      <button onClick={onCloseClick} aria-label={tr('Close', 'Schließen')} className="absolute top-3 right-3 text-2xl leading-none">
        ✕
      </button>
      <span className="text-xs uppercase font-bold text-retro-amber-dark block">Feedback</span>
      <h3 className="text-3xl font-bold mb-5">{tr('Your opinion matters', 'Deine Meinung zählt')}</h3>

      {status === 'sent' ? (
        <div className="py-6">
          <p className="font-bold mb-2">{tr('Thanks for your feedback! 🙏', 'Danke für dein Feedback! 🙏')}</p>
          <p className="text-sm text-retro-brown">{tr('It’s on its way to us right now.', 'Es ist gerade auf dem Weg zu uns.')}</p>
          <button onClick={onCloseClick} className="retro-button mt-6 px-4 py-2 border-2 border-retro-ink bg-retro-amber font-bold">
            {tr('Close', 'Schließen')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-retro-brown mb-4">
            {tr(
              'Praise, criticism, suggestions or wishes – tell us what’s on your mind.',
              'Lob, Tadel, Vorschläge oder Wünsche – schreib uns, was dir auf dem Herzen liegt.'
            )}
          </p>

          <fieldset className="mb-4">
            <legend className="text-[10px] font-bold uppercase text-retro-tan mb-2">{tr('Type of feedback', 'Art des Feedbacks')}</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={category === c.value}
                  className={`retro-button px-3 py-1.5 text-xs font-bold border-2 border-retro-ink ${
                    category === c.value ? 'bg-retro-amber text-white' : 'bg-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label htmlFor="rm-feedback-message" className="block text-[10px] font-bold uppercase text-retro-tan mb-1">
            {tr('Your message', 'Deine Nachricht')}
          </label>
          <textarea
            id="rm-feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={5}
            required
            placeholder={tr('Tell us what you think…', 'Schreib uns, was du denkst…')}
            className="w-full text-sm p-3 border-2 border-retro-ink bg-white focus:outline-none focus:ring-2 focus:ring-retro-amber resize-none"
          />
          <p className="text-[10px] text-retro-tan text-right mt-1">{trimmed.length} / {MAX_LENGTH}</p>

          <label htmlFor="rm-feedback-email" className="block text-[10px] font-bold uppercase text-retro-tan mb-1 mt-3">
            {tr('Your email (optional, if you’d like a reply)', 'Deine E-Mail (optional, falls du eine Antwort möchtest)')}
          </label>
          <input
            id="rm-feedback-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder={tr('name@example.com', 'name@beispiel.de')}
            className="w-full text-sm p-2 border-2 border-retro-ink bg-white focus:outline-none focus:ring-2 focus:ring-retro-amber"
          />
          <p className="text-[10px] text-retro-tan mt-2">
            {tr(
              'Your message is saved to our public feedback list without your email address.',
              'Deine Nachricht wird ohne E-Mail-Adresse in unserer öffentlichen Feedback-Liste gespeichert.'
            )}
          </p>

          {status === 'error' && (
            <p role="alert" className="text-xs text-red-700 font-bold mt-3">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="retro-button mt-5 px-4 py-2 border-2 border-retro-ink bg-retro-amber font-bold w-full disabled:opacity-40"
          >
            {status === 'sending' ? tr('Sending…', 'Wird gesendet…') : tr('Send feedback', 'Feedback absenden')}
          </button>
        </form>
      )}
    </Modal>
  );
};
