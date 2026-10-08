import React, { useState } from 'react';
import { BuzzwordCategory, VideoStatus } from '../types';
import { DECADES_DB } from '../constants';
import { useMuted } from '../lib/mute';
import { useWarmChrome } from '../lib/theme';
import { tr } from '../lib/i18n';

const CATEGORY: Record<BuzzwordCategory, { icon: string; label: string }> = {
  music: { icon: '🎵', label: tr('Music', 'Musik') },
  tech: { icon: '📺', label: tr('Tech', 'Technik') },
  toy: { icon: '🧸', label: tr('Toys', 'Spielzeug') },
  lifestyle: { icon: '👗', label: tr('Everyday Life & Fashion', 'Alltag & Mode') },
  food: { icon: '🍬', label: tr('Snacks & Food', 'Naschen & Essen') },
};

const AiNotice: React.FC<{ aiOff: boolean }> = ({ aiOff }) =>
  aiOff ? (
    <div className="mb-6 border-2 border-retro-ink bg-retro-highlight p-3 text-sm text-retro-ink">
      {tr(
        <>
          <strong>Demo note:</strong> This demo runs without an AI key. Memory questions come from the
          collection; photo analysis, video and the chat companion are turned off.
        </>,
        <>
          <strong>Demo-Hinweis:</strong> Dieses Demo läuft ohne KI-Schlüssel. Erinnerungsfragen kommen aus der
          Sammlung; Bildanalyse, Video und Chat-Begleiter sind deaktiviert.
        </>
      )}
    </div>
  ) : null;

export const ExplorationPhase: React.FC<{
  aiOff: boolean;
  uploadedImage: string | null;
  uploadError: string | null;
  analysis: string | null;
  analysisSaved: boolean;
  videoStatus: VideoStatus;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onAnalyze: () => void;
  onSaveAnalysis: () => void;
  onGenerateVideo: () => void;
  focusDecade: string;
  userCategories: Set<BuzzwordCategory>;
  clickedBuzzwords: string[];
  memoriesCount: number;
  isAnswered: (id: string) => boolean;
  onOpenBuzzword: (wordId: string, term: string, knowledge: string, decade: string, fallbackQuestion: string) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({
  aiOff,
  uploadedImage,
  uploadError,
  analysis,
  analysisSaved,
  videoStatus,
  onImageUpload,
  onClearImage,
  onAnalyze,
  onSaveAnalysis,
  onGenerateVideo,
  focusDecade,
  userCategories,
  clickedBuzzwords,
  memoriesCount,
  isAnswered,
  onOpenBuzzword,
  onBack,
  onNext,
}) => {
  const muted = useMuted();
  const warm = useWarmChrome();
  // The journey split into "Sparten" (Marco, 2026-10-06): a calm overview
  // of tiles, and only the one tapped opens, when the mood strikes.
  type Sparte = BuzzwordCategory | 'lab';
  const [sparte, setSparte] = useState<Sparte | null>(uploadedImage ? 'lab' : null);
  const open = (next: Sparte | null) => {
    setSparte(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Own decade first, then the others in order.
  const decades = Object.keys(DECADES_DB).sort((a, b) => (a === focusDecade ? -1 : b === focusDecade ? 1 : a.localeCompare(b)));
  const allWords = Object.keys(DECADES_DB).flatMap((year) => DECADES_DB[year].buzzwords.map((bw) => ({ ...bw, year })));
  const categories = (Object.keys(CATEGORY) as BuzzwordCategory[]).sort(
    (a, b) => (userCategories.has(a) ? 0 : 1) - (userCategories.has(b) ? 0 : 1)
  );
  const label = (id: string) =>
    isAnswered(id)
      ? tr('✓ In your memory book', '✓ Im Erinnerungsbuch')
      : clickedBuzzwords.includes(id)
      ? tr('Keep telling', 'Weiter erzählen')
      : tr('+ Remember', '+ Erinnern');

  const tileClass = warm
    ? 'retro-card bg-retro-paper-white p-5 text-left flex flex-col gap-1 min-h-[132px]'
    : 'border-2 border-retro-ink bg-white p-5 text-left flex flex-col gap-1 min-h-[132px] hover:bg-retro-cream';

  const overview = (
    <div className="space-y-8">
      <header className="space-y-3">
        <h2 className="text-3xl md:text-4xl">{tr('What are you in the mood for?', 'Worauf hast du Lust?')}</h2>
        <p className="text-retro-brown leading-relaxed max-w-prose">
          {tr(
            'Pick a category. Inside you’ll find things from your era and the decades around it.',
            'Such dir eine Sparte aus. Darin findest du Dinge aus deiner Zeit und den Jahrzehnten drumherum.'
          )}
        </p>
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const words = allWords.filter((w) => w.category === cat);
          const done = words.filter((w) => isAnswered(w.id)).length;
          return (
            <button key={cat} onClick={() => open(cat)} className={tileClass}>
              <span aria-hidden="true" className="text-3xl mb-1">{CATEGORY[cat].icon}</span>
              <span className="font-bold text-lg leading-tight text-retro-ink">{CATEGORY[cat].label}</span>
              <span className="text-sm text-retro-brown">
                {done > 0
                  ? tr(`${done} of ${words.length} remembered`, `${done} von ${words.length} erinnert`)
                  : tr(`${words.length} memories waiting`, `${words.length} Erinnerungen warten`)}
              </span>
              {userCategories.has(cat) && <span className="text-xs font-semibold text-[#34645c]">{tr('★ your interest', '★ dein Interesse')}</span>}
            </button>
          );
        })}
        <button onClick={() => open('lab')} className={tileClass}>
          <span aria-hidden="true" className="text-3xl mb-1">📷</span>
          <span className="font-bold text-lg leading-tight text-retro-ink">{tr('Photo Lab', 'Foto-Labor')}</span>
          <span className="text-sm text-retro-brown">{tr('Bring an old photo', 'Ein altes Foto mitbringen')}</span>
        </button>
      </div>
      <p className="text-center text-sm text-retro-brown">
        {tr(
          `${memoriesCount} memor${memoriesCount === 1 ? 'y' : 'ies'} in your book so far`,
          `Insgesamt ${memoriesCount} Erinnerung${memoriesCount === 1 ? '' : 'en'} in deinem Buch`
        )}
      </p>
    </div>
  );

  const backButton = (
    <button
      onClick={() => open(null)}
      className={`font-semibold ${warm ? 'px-5 h-11 rounded-full bg-[#eee0d6] text-retro-ink' : 'px-4 py-2 border-2 border-retro-ink/30'}`}
    >
      {tr('← All categories', '← Alle Sparten')}
    </button>
  );

  // One Sparte: its things decade by decade, the visitor's own first.
  const sparteView = (cat: BuzzwordCategory) => (
    <div className="space-y-10">
      <header className="space-y-5">
        {backButton}
        <h2 className="text-3xl md:text-4xl flex items-center gap-3">
          <span aria-hidden="true">{CATEGORY[cat].icon}</span> {CATEGORY[cat].label}
        </h2>
      </header>
      {decades.map((year) => {
        const words = DECADES_DB[year].buzzwords.filter((bw) => bw.category === cat);
        if (words.length === 0) return null;
        return (
          <section key={year} className="space-y-4">
            <h3 className="text-sm uppercase tracking-wide font-bold text-retro-brown">
              {tr(`${year}s`, `${year}er`)}
              {year === focusDecade && <span className="text-retro-amber-dark">{tr(' · your era', ' · deine Zeit')}</span>}
            </h3>
            {warm ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {words.map((bw) => (
                  <button
                    key={bw.id}
                    onClick={() => onOpenBuzzword(bw.id, bw.term, bw.knowledge, year, bw.question)}
                    className="retro-card bg-retro-paper-white p-6 text-left flex flex-col gap-2"
                  >
                    <span className="font-display text-xl text-retro-ink">{bw.term}</span>
                    <span className="text-retro-brown leading-relaxed">{bw.knowledge}</span>
                    <span className={`mt-2 text-sm font-semibold ${isAnswered(bw.id) ? 'text-[#34645c]' : 'text-retro-amber-dark'}`}>
                      {label(bw.id)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {words.map((bw) => {
                  const answered = isAnswered(bw.id);
                  const clicked = clickedBuzzwords.includes(bw.id);
                  return (
                    <button
                      key={bw.id}
                      onClick={() => onOpenBuzzword(bw.id, bw.term, bw.knowledge, year, bw.question)}
                      aria-label={`${bw.term}: ${label(bw.id)}`}
                      className={`px-5 py-3 border-2 font-bold relative ${
                        answered
                          ? 'bg-retro-green text-white border-transparent'
                          : clicked
                          ? 'bg-retro-purple text-white border-transparent'
                          : 'bg-white border-retro-ink hover:bg-retro-cream'
                      }`}
                    >
                      {bw.term}
                      {answered && <span aria-hidden="true" className="absolute -top-2 -right-2 text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );

  const lab = (
    <>
    {/* Memory lab */}
    <div className="retro-card p-6 md:p-8 bg-retro-cream-light border-4 border-double">
      <h2 className="text-3xl mb-3 flex items-center gap-3">
        <span aria-hidden="true">🧪</span> {tr('The Memory Lab', 'Das Memory-Labor')}
      </h2>
      <p className="mb-6 text-retro-brown italic">
        {tr(
          'Upload an old photo. The AI describes it for you – and you can keep the description as a memory.',
          'Lade ein altes Foto hoch. Die KI beschreibt es dir – und du kannst die Beschreibung als Erinnerung behalten.'
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-4 border-dashed border-retro-ink/20 p-6 bg-white min-h-[280px] flex flex-col items-center justify-center text-center">
          {uploadedImage ? (
            <>
              <div className="retro-photo-frame inline-block">
                <img
                  src={uploadedImage}
                  alt={tr('Your uploaded photo', 'Dein hochgeladenes Foto')}
                  className="max-h-56 border-2 border-retro-ink shadow-md retro-photo retro-photo-live"
                />
              </div>
              <button onClick={onClearImage} className="mt-3 text-xs underline font-bold text-retro-brown">
                {tr('Choose a different picture', 'Anderes Bild wählen')}
              </button>
            </>
          ) : (
            <label className="retro-button bg-retro-ink text-white px-6 py-3 cursor-pointer font-bold">
              {tr('Upload a picture', 'Bild hochladen')}
              <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
            </label>
          )}
          {uploadError && <p className="mt-3 text-xs font-bold text-red-700">{uploadError}</p>}
        </div>

        <div className="space-y-4">
          <button
            disabled={!uploadedImage || aiOff}
            onClick={onAnalyze}
            className={`retro-button py-3 font-bold w-full ${!uploadedImage || aiOff ? 'opacity-50 cursor-not-allowed bg-white' : 'bg-white hover:bg-gray-100'}`}
          >
            {tr('Describe my photo', 'Foto beschreiben lassen')}
          </button>
          <div>
            <button
              disabled={!uploadedImage || aiOff || videoStatus.status === 'generating'}
              onClick={onGenerateVideo}
              className={`retro-button py-3 font-bold text-white w-full ${
                !uploadedImage || aiOff || videoStatus.status === 'generating' ? 'bg-gray-400 cursor-not-allowed' : 'bg-retro-amber hover:bg-retro-amber-dark'
              }`}
            >
              {videoStatus.status === 'generating'
                ? tr('AI at work…', 'KI arbeitet…')
                : tr('Bring the photo to life (video)', 'Foto zum Leben erwecken (Video)')}
            </button>
            <p className="text-xs mt-1 text-retro-tan text-center">
              {tr('The video feature needs a Google project with billing enabled.', 'Video-Funktion benötigt ein Google-Projekt mit Billing.')}
            </p>
          </div>

          {analysis && (
            <div className="p-4 bg-white border-2 border-retro-ink text-sm leading-relaxed">
              <p className="font-bold mb-2 uppercase text-retro-amber-dark">{tr('Nostalgic description', 'Nostalgische Beschreibung')}</p>
              <div className="whitespace-pre-wrap">{analysis}</div>
              {analysis !== tr('Analyzing…', 'Analysiere…') && (
                <button
                  onClick={onSaveAnalysis}
                  disabled={analysisSaved}
                  className="mt-3 text-xs font-bold uppercase border-2 border-retro-ink px-3 py-1.5 bg-retro-cream disabled:opacity-50"
                >
                  {analysisSaved ? tr('✓ Saved in your book', '✓ Im Buch gespeichert') : tr('Add as a memory', 'Zur Erinnerung hinzufügen')}
                </button>
              )}
            </div>
          )}

          {videoStatus.status !== 'idle' && (
            <div className="p-4 bg-retro-ink text-white border-2 border-white">
              <p className="text-xs font-bold uppercase mb-1">
                {videoStatus.status === 'generating'
                  ? tr('Developing the film roll…', 'Filmrolle wird entwickelt…')
                  : videoStatus.status === 'done'
                  ? tr('Done!', 'Fertig!')
                  : tr('Note', 'Hinweis')}
              </p>
              <p className="text-xs opacity-90">{videoStatus.message}</p>
              {videoStatus.url && (
                <div className="mt-3">
                  <video src={videoStatus.url} controls muted={muted} className="w-full border-2 border-white" />
                  <a href={videoStatus.url} className="text-xs underline mt-2 block font-bold text-orange-200">
                    {tr('Download video', 'Video herunterladen')}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    </>
  );

  return (
  <div className="py-10 animate-fadeIn space-y-12">
    <AiNotice aiOff={aiOff} />
    {sparte === null && overview}
    {sparte === 'lab' && (
      <div className="space-y-5">
        {backButton}
        {lab}
      </div>
    )}
    {sparte !== null && sparte !== 'lab' && sparteView(sparte)}

    <div className="flex flex-wrap justify-center gap-4 pt-6">
      <button onClick={onBack} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white">
        {tr('← Back to the impressions', '← Zu den Impressionen')}
      </button>
      <button onClick={onNext} className="retro-button bg-retro-ink text-white px-10 py-4 font-bold">
        {tr('On to the diary', 'Weiter zum Tagebuch')} ({memoriesCount})
      </button>
    </div>
  </div>
);
};
