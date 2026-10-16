import React, { useState } from 'react';
import { AppPhase } from '../types';
import { tr } from '../lib/i18n';
import { CozyRoom, DayTime, dayTime } from './CozyRoom';
import { WeatherSwitch } from './WeatherSwitch';
import { useWindowWeather } from '../lib/weather';
import { eraShort, useRoomEra } from '../lib/roomEra';
import { gamingHref } from '../lib/gamingLink';

// The Stube at the top of the start page, in every design (Marco,
// 2026-10-13: "das gemütliche Wohnzimmer fehlt immer noch ganz. Ich dachte
// das bringt ein größeres Update in Haptik und Optik"): the touchable room
// (components/CozyRoom.tsx), a greeting that knows the time of day, a line
// on what can be touched, and the switch for the real weather in the window.

// A greeting that knows the time of day, like someone at home who looks up
// when you come in.
function cozyGreeting(time: DayTime, userName: string): { title: string; line: string } {
  const name = userName.trim();
  const n = name ? `, ${name}` : '';
  switch (time) {
    case 'morning':
      return { title: tr(`Good morning${n}`, `Guten Morgen${n}`), line: tr('The coffee is fresh, have a seat.', 'Der Kaffee ist frisch, setz dich zu uns.') };
    case 'day':
      return { title: tr(`How lovely you’re here${n}`, `Schön, dass du da bist${n}`), line: tr('Make yourself at home, the tea is steeping.', 'Mach es dir gemütlich, der Tee zieht schon.') };
    case 'evening':
      return { title: tr(`Good evening${n}`, `Guten Abend${n}`), line: tr('The lamp is on and the couch is warm.', 'Die Lampe brennt und die Couch ist warm.') };
    default:
      return { title: tr(`Still up${n}?`, `Noch wach${n}?`), line: tr('Snuggle in, the lamp is still on for you.', 'Kuschel dich ein, die Lampe brennt noch für dich.') };
  }
}

export const LivingRoom: React.FC<{
  warm: boolean;
  userName: string;
  resuming: boolean;
  onStart: () => void;
  onResume: () => void;
  onOpenStage: (phase: AppPhase) => void;
}> = ({ warm, userName, resuming, onStart, onResume, onOpenStage }) => {
  const time = dayTime();
  const weather = useWindowWeather();
  const greeting = cozyGreeting(time, userName);
  const [weatherAsk, setWeatherAsk] = useState(0);
  const era = useRoomEra();
  return (
    <section aria-label={tr('Your living room', 'Deine Stube')} className={warm ? '' : 'w-full max-w-2xl mx-auto mb-6 text-center'}>
      <div className={`cozy-frame rounded-xl overflow-hidden mb-4 ${warm ? '' : 'border-4 border-retro-ink'}`}>
        <CozyRoom
          time={time}
          weather={weather}
          interactive
          tvLabel={resuming ? tr('TV: continue your journey', 'Fernseher: deine Reise fortsetzen') : tr('TV: start the time travel', 'Fernseher: Zeitreise starten')}
          actions={{
            onTv: resuming ? onResume : onStart,
            onWindow: () => setWeatherAsk((n) => n + 1),
            // The stations exist once a journey has begun.
            onPicture: resuming ? () => onOpenStage('exploration') : undefined,
            onBooks: resuming ? () => onOpenStage('book') : undefined,
            onArcade: () => window.location.assign(gamingHref()),
          }}
        />
      </div>
      {era && (
        <p key={era} className="rm-era-note text-center mb-2 px-2">
          {tr(`🛋️ Furnished like the ${eraShort(era)}s: wallpaper, couch and radio of your decade`, `🛋️ Eingerichtet wie in den ${eraShort(era)}ern: Tapete, Couch und Radio deines Jahrzehnts`)}
        </p>
      )}
      <p className="text-sm text-retro-brown text-center mb-3 px-2 leading-snug">
        {resuming
          ? tr(
              '👆 Everything here can be touched: the TV takes you back to your journey, the picture to your decades, the books to your memory book, and the arcade machine to the arcade next door. Lamp, stove, cat and window do something too.',
              '👆 Hier kannst du alles antippen: Der Fernseher bringt dich zurück zu deiner Reise, das Bild zu deinen Jahrzehnten, die Bücher zu deinem Erinnerungsbuch und der Spielautomat in die Spielhalle nebenan. Auch Lampe, Ofen, Katze und Fenster tun etwas.'
            )
          : tr(
              '👆 Everything here can be touched: tap the TV and the time travel begins, tap the arcade machine and you’re in the arcade next door. Lamp, stove, cat and window do something too.',
              '👆 Hier kannst du alles antippen: Tippe auf den Fernseher, und die Zeitreise geht los, tippe auf den Spielautomaten, und du stehst in der Spielhalle nebenan. Auch Lampe, Ofen, Katze und Fenster tun etwas.'
            )}
      </p>
      <WeatherSwitch openSignal={weatherAsk} />
      <div className={warm ? 'px-2' : ''}>
        <h2 className={warm ? 'text-2xl md:text-3xl mt-1 mb-1' : 'text-3xl md:text-4xl mb-1'}>{greeting.title}</h2>
        <p className="text-lg italic text-retro-brown mb-4">{greeting.line}</p>
      </div>
    </section>
  );
};
