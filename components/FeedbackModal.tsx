import React, { useState } from 'react';
import { Modal } from './Modal';
import { submitFeedback, FeedbackCategory } from '../services/feedbackService';

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'lob', label: 'Lob' },
  { value: 'tadel', label: 'Tadel' },
  { value: 'vorschlag', label: 'Vorschlag' },
  { value: 'wunsch', label: 'Wunsch' },
  { value: 'sonstiges', label: 'Sonstiges' },
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
        (err as { message?: string })?.message || 'Das Feedback konnte nicht gesendet werden.'
      );
    }
  };

  return (
    <Modal onClose={onDismiss} label="Feedback geben">
      <button onClick={onCloseClick} aria-label="Schließen" className="absolute top-3 right-3 text-2xl leading-none">
        ✕
      </button>
      <span className="text-xs uppercase font-bold text-retro-amber-dark block">Feedback</span>
      <h3 className="text-3xl font-bold mb-5">Deine Meinung zählt</h3>

      {status === 'sent' ? (
        <div className="py-6">
          <p className="font-bold mb-2">Danke für dein Feedback! 🙏</p>
          <p className="text-sm text-retro-brown">Es ist gerade auf dem Weg zu uns.</p>
          <button onClick={onCloseClick} className="retro-button mt-6 px-4 py-2 border-2 border-retro-ink bg-retro-amber font-bold">
            Schließen
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-retro-brown mb-4">
            Lob, Tadel, Vorschläge oder Wünsche – schreib uns, was dir auf dem Herzen liegt.
          </p>

          <fieldset className="mb-4">
            <legend className="text-[10px] font-bold uppercase text-retro-tan mb-2">Art des Feedbacks</legend>
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
            Deine Nachricht
          </label>
          <textarea
            id="rm-feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={5}
            required
            placeholder="Schreib uns, was du denkst…"
            className="w-full text-sm p-3 border-2 border-retro-ink bg-white focus:outline-none focus:ring-2 focus:ring-retro-amber resize-none"
          />
          <p className="text-[10px] text-retro-tan text-right mt-1">{trimmed.length} / {MAX_LENGTH}</p>

          <label htmlFor="rm-feedback-email" className="block text-[10px] font-bold uppercase text-retro-tan mb-1 mt-3">
            Deine E-Mail (optional, falls du eine Antwort möchtest)
          </label>
          <input
            id="rm-feedback-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="name@beispiel.de"
            className="w-full text-sm p-2 border-2 border-retro-ink bg-white focus:outline-none focus:ring-2 focus:ring-retro-amber"
          />

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
            {status === 'sending' ? 'Wird gesendet…' : 'Feedback absenden'}
          </button>
        </form>
      )}
    </Modal>
  );
};
