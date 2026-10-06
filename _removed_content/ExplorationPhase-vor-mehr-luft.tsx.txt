import React, { useState } from 'react';
import { BuzzwordCategory, VideoStatus } from '../types';
import { DECADES_DB } from '../constants';
import { useMuted } from '../lib/mute';
import { useWarmChrome } from '../lib/theme';

const CATEGORY: Record<BuzzwordCategory, { icon: string; label: string }> = {
  music: { icon: '🎵', label: 'Musik' },
  tech: { icon: '📺', label: 'Technik' },
  toy: { icon: '🧸', label: 'Spielzeug' },
  lifestyle: { icon: '👗', label: 'Alltag & Mode' },
  food: { icon: '🍬', label: 'Naschen & Essen' },
};

const AiNotice: React.FC<{ aiOff: boolean }> = ({ aiOff }) =>
  aiOff ? (
    <div className="mb-6 border-2 border-retro-ink bg-retro-highlight p-3 text-sm text-retro-ink">
      <strong>Demo-Hinweis:</strong> Dieses Demo läuft ohne KI-Schlüssel. Erinnerungsfragen kommen aus der
      Sammlung; Bildanalyse, Video und Chat-Begleiter sind deaktiviert.
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
  const [warmDecade, setWarmDecade] = useState(DECADES_DB[focusDecade] ? focusDecade : Object.keys(DECADES_DB)[0]);

  const sortedBuzzwords = (year: string) =>
    [...DECADES_DB[year].buzzwords].sort((a, b) => {
      const am = userCategories.has(a.category) ? 0 : 1;
      const bm = userCategories.has(b.category) ? 0 : 1;
      return am - bm;
    });

  // "Retro Warm": one decade at a time, as cards (after the Stitch mock-up).
  const warmWall = () => {
    const words = sortedBuzzwords(warmDecade);
    const answeredCount = words.filter((bw) => isAnswered(bw.id)).length;
    return (
      <div>
        <h2 className="text-3xl mb-2">Popkultur &amp; Zeitgeist</h2>
        <p className="text-retro-brown mb-5">
          Tippe auf ein Phänomen. Du bekommst eine persönliche Frage, und deine Antwort kommt in dein
          Erinnerungsbuch. {userCategories.size > 0 && 'Was zu deinen Interessen passt, steht vorne.'}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4">
          {Object.keys(DECADES_DB).map((year) => (
            <button
              key={year}
              onClick={() => setWarmDecade(year)}
              aria-pressed={year === warmDecade}
              className={`px-5 h-11 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${
                year === warmDecade ? 'bg-retro-amber-dark text-white' : 'bg-[#eee0d6] text-retro-ink'
              }`}
            >
              {year === warmDecade && '✓ '}
              {year}er
            </button>
          ))}
        </div>
        <p className="text-sm text-retro-brown mb-4">
          {DECADES_DB[warmDecade].title}
          {warmDecade === focusDecade && <span className="ml-2 font-semibold text-retro-amber-dark">· deine Zeit</span>}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map((bw) => {
            const answered = isAnswered(bw.id);
            const clicked = clickedBuzzwords.includes(bw.id);
            const cat = CATEGORY[bw.category];
            return (
              <article key={bw.id} className="retro-card bg-retro-paper-white p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-retro-cream px-3 py-1 text-xs font-semibold text-retro-amber-dark">
                    <span aria-hidden="true">{cat.icon}</span> {cat.label}
                  </span>
                  {userCategories.has(bw.category) && <span className="text-xs font-semibold text-[#34645c]">★ dein Interesse</span>}
                </div>
                <h3 className="text-xl mb-1">{bw.term}</h3>
                <p className="text-sm text-retro-brown mb-4 flex-grow">{bw.knowledge}</p>
                <button
                  onClick={() => onOpenBuzzword(bw.id, bw.term, bw.knowledge, warmDecade, bw.question)}
                  className={`h-11 rounded-full font-semibold text-sm ${
                    answered ? 'bg-[#4b7b72]/15 text-[#34645c]' : 'bg-retro-cream text-retro-amber-dark'
                  }`}
                >
                  {answered ? '✓ Im Erinnerungsbuch' : clicked ? 'Weiter erzählen' : '+ Erinnern'}
                </button>
              </article>
            );
          })}
        </div>
        <div className="mt-6 rounded-2xl bg-retro-highlight p-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="font-semibold">
            {answeredCount} von {words.length} Schätzen erinnert
            <span className="block text-sm font-normal text-retro-brown">{warmDecade}er · insgesamt {memoriesCount} Erinnerungen</span>
          </p>
          <button onClick={onNext} className="retro-button bg-retro-amber text-white px-6 font-bold">
            Tagebuch →
          </button>
        </div>
      </div>
    );
  };

  const lab = (
    <>
    {/* Memory lab */}
    <div className="retro-card p-6 md:p-8 bg-retro-cream-light border-4 border-double">
      <h2 className="text-3xl mb-3 flex items-center gap-3">
        <span aria-hidden="true">🧪</span> Das Memory-Labor
      </h2>
      <p className="mb-6 text-retro-brown italic">
        Lade ein altes Foto hoch. Die KI beschreibt es dir – und du kannst die Beschreibung als Erinnerung behalten.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-4 border-dashed border-retro-ink/20 p-6 bg-white min-h-[280px] flex flex-col items-center justify-center text-center">
          {uploadedImage ? (
            <>
              <div className="retro-photo-frame inline-block">
                <img
                  src={uploadedImage}
                  alt="Dein hochgeladenes Foto"
                  className="max-h-56 border-2 border-retro-ink shadow-md retro-photo retro-photo-live"
                />
              </div>
              <button onClick={onClearImage} className="mt-3 text-xs underline font-bold text-retro-brown">
                Anderes Bild wählen
              </button>
            </>
          ) : (
            <label className="retro-button bg-retro-ink text-white px-6 py-3 cursor-pointer font-bold">
              Bild hochladen
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
            Foto beschreiben lassen
          </button>
          <div>
            <button
              disabled={!uploadedImage || aiOff || videoStatus.status === 'generating'}
              onClick={onGenerateVideo}
              className={`retro-button py-3 font-bold text-white w-full ${
                !uploadedImage || aiOff || videoStatus.status === 'generating' ? 'bg-gray-400 cursor-not-allowed' : 'bg-retro-amber hover:bg-retro-amber-dark'
              }`}
            >
              {videoStatus.status === 'generating' ? 'KI arbeitet…' : 'Foto zum Leben erwecken (Video)'}
            </button>
            <p className="text-xs mt-1 text-retro-tan text-center">
              Video-Funktion benötigt ein Google-Projekt mit Billing.
            </p>
          </div>

          {analysis && (
            <div className="p-4 bg-white border-2 border-retro-ink text-sm leading-relaxed">
              <p className="font-bold mb-2 uppercase text-retro-amber-dark">Nostalgische Beschreibung</p>
              <div className="whitespace-pre-wrap">{analysis}</div>
              {analysis !== 'Analysiere…' && (
                <button
                  onClick={onSaveAnalysis}
                  disabled={analysisSaved}
                  className="mt-3 text-xs font-bold uppercase border-2 border-retro-ink px-3 py-1.5 bg-retro-cream disabled:opacity-50"
                >
                  {analysisSaved ? '✓ Im Buch gespeichert' : 'Zur Erinnerung hinzufügen'}
                </button>
              )}
            </div>
          )}

          {videoStatus.status !== 'idle' && (
            <div className="p-4 bg-retro-ink text-white border-2 border-white">
              <p className="text-xs font-bold uppercase mb-1">
                {videoStatus.status === 'generating' ? 'Filmrolle wird entwickelt…' : videoStatus.status === 'done' ? 'Fertig!' : 'Hinweis'}
              </p>
              <p className="text-xs opacity-90">{videoStatus.message}</p>
              {videoStatus.url && (
                <div className="mt-3">
                  <video src={videoStatus.url} controls muted={muted} className="w-full border-2 border-white" />
                  <a href={videoStatus.url} className="text-xs underline mt-2 block font-bold text-orange-200">
                    Video herunterladen
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

  const classicWall = (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl border-b-2 border-retro-ink pb-2">Die Erinnerungs-Wand</h2>
        <p className="text-sm text-retro-brown mt-2">
          Tippe auf ein Stichwort. Du bekommst eine persönliche Frage – und ein Feld, um deine Antwort
          festzuhalten. {userCategories.size > 0 && 'Stichworte zu deinen Interessen stehen oben.'}
        </p>
      </div>

      {Object.entries(DECADES_DB).map(([year, data]) => {
        const sorted = sortedBuzzwords(year);
        return (
          <div
            key={year}
            className={`p-5 rounded-lg ${year === focusDecade ? 'bg-retro-highlight border-2 border-dashed border-retro-amber' : ''}`}
          >
            <h3 className="text-2xl mb-5 flex items-center gap-3 flex-wrap">
              <span className="bg-retro-ink text-white px-3 py-1 text-sm font-bold">{year}er</span>
              {data.title}
              {year === focusDecade && <span className="text-xs uppercase font-bold text-retro-amber-dark">deine Zeit</span>}
            </h3>
            <div className="flex flex-wrap gap-3">
              {sorted.map((bw) => {
                const answered = isAnswered(bw.id);
                const clicked = clickedBuzzwords.includes(bw.id);
                const highlight = userCategories.has(bw.category);
                return (
                  <button
                    key={bw.id}
                    onClick={() => onOpenBuzzword(bw.id, bw.term, bw.knowledge, year, bw.question)}
                    className={`px-5 py-3 border-2 font-bold relative ${
                      answered
                        ? 'bg-retro-green text-white border-transparent'
                        : clicked
                        ? 'bg-retro-purple text-white border-transparent'
                        : 'bg-white border-retro-ink hover:bg-retro-cream'
                    }`}
                  >
                    {highlight && <span aria-hidden="true" className="mr-1">★</span>}
                    {bw.term}
                    {answered && <span aria-hidden="true" className="absolute -top-2 -right-2 text-sm">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
  <div className="py-8 animate-fadeIn space-y-14">
    <AiNotice aiOff={aiOff} />
    {warm ? (
      <>
        {warmWall()}
        {lab}
      </>
    ) : (
      <>
        {lab}
        {classicWall}
      </>
    )}

    <div className="flex flex-wrap justify-center gap-4 pt-4">
      <button onClick={onBack} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white">
        ← Zu den Impressionen
      </button>
      <button onClick={onNext} className="retro-button bg-retro-ink text-white px-10 py-4 font-bold">
        Weiter zum Tagebuch ({memoriesCount})
      </button>
    </div>
  </div>
);
};
