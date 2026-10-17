import React, { useRef, useState } from 'react';
import { acceptFor, EMU_SYSTEMS, EmuLaunch, EmuSystem, FREE_GAMES } from '../lib/emulator';
import { platformLabel } from '../data/platforms';
import { tr } from '../../lib/i18n';

// "Die Retro-Konsole" in the Chill-Ecke: real old consoles in the browser.
// The free homebrew games start with one tap; any other game comes as a file
// from the player's own device.

export const OWN_FILE_NOTE = tr(
  'Only use game files you legally own. RetroMind provides no commercial games, and your file stays on your device.',
  'Nur Spieldateien nutzen, die du rechtmäßig besitzt. RetroMind stellt keine kommerziellen Spiele bereit, und deine Datei bleibt auf deinem Gerät.'
);

/** A hidden file picker for one system; `pick` opens it. */
export function useRomPicker(onFile: (file: File, system: EmuSystem) => void) {
  const input = useRef<HTMLInputElement>(null);
  const system = useRef<EmuSystem | null>(null);
  const pick = (s: EmuSystem) => {
    system.current = s;
    if (input.current) {
      input.current.accept = acceptFor(s);
      input.current.value = '';
      input.current.click();
    }
  };
  const element = (
    <input
      ref={input}
      type="file"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && system.current) onFile(file, system.current);
      }}
    />
  );
  return { pick, element };
}

const systemName = (s: EmuSystem) => s.platforms.map(platformLabel).join(' / ');

export const EmulatorCorner: React.FC<{ onPlay: (launch: EmuLaunch) => void }> = ({ onPlay }) => {
  const [system, setSystem] = useState(0);
  const picker = useRomPicker((file) => onPlay({ title: file.name.replace(/\.[^.]+$/, ''), core: EMU_SYSTEMS[system].core, file }));

  return (
    <section className="emu-corner" aria-label={tr('The retro console', 'Die Retro-Konsole')}>
      <h3 className="pixel-font">{tr('🕹️ THE RETRO CONSOLE', '🕹️ DIE RETRO-KONSOLE')}</h3>
      <p className="dim archive-count">
        {tr(
          'Real old consoles, emulated right in your browser. These games are free homebrew whose makers allow sharing them.',
          'Echte alte Konsolen, direkt im Browser nachgebaut. Diese Spiele sind freie Homebrew-Spiele, deren Macher das Weitergeben erlauben.'
        )}
      </p>
      <div className="grid mini-list" style={{ marginTop: 12 }}>
        {FREE_GAMES.map((g) => (
          <button key={g.id} className="panel mini-card" onClick={() => onPlay({ title: g.title, core: g.core, rom: g.rom })} data-nav>
            <span className="mini-icon" aria-hidden="true">
              {g.platform === 'NES' ? '🎮' : '🔋'}
            </span>
            <span className="pixel-font mini-title">{g.title.toUpperCase()}</span>
            <span>{g.text}</span>
            <span className="dim mini-best">
              {platformLabel(g.platform)} · {g.year} · {g.by} · {g.licence}
            </span>
          </button>
        ))}
        <div className="panel mini-card emu-own">
          <span className="mini-icon" aria-hidden="true">
            💾
          </span>
          <span className="pixel-font mini-title">{tr('YOUR OWN MODULE', 'DEIN EIGENES MODUL')}</span>
          <label>
            {tr('Console', 'Konsole')}{' '}
            <select value={system} onChange={(e) => setSystem(Number(e.target.value))}>
              {EMU_SYSTEMS.map((s, i) => (
                <option key={s.core} value={i}>
                  {systemName(s)}
                </option>
              ))}
            </select>
          </label>
          <button className="px-btn" onClick={() => picker.pick(EMU_SYSTEMS[system])} data-nav>
            {tr('📂 PICK GAME FILE', '📂 SPIELDATEI WÄHLEN')}
          </button>
          <span className="dim mini-best">{OWN_FILE_NOTE}</span>
          {picker.element}
        </div>
      </div>
      <p className="dim emu-credits">
        {tr('Emulator: ', 'Emulator: ')}
        <a href="https://github.com/EmulatorJS/EmulatorJS" target="_blank" rel="noreferrer">
          EmulatorJS
        </a>{' '}
        (GPL 3.0) · {tr('Games: ', 'Spiele: ')}
        {FREE_GAMES.map((g, i) => (
          <React.Fragment key={g.id}>
            {i > 0 && ', '}
            <a href={g.source} target="_blank" rel="noreferrer">
              {g.title}
            </a>
          </React.Fragment>
        ))}
      </p>
    </section>
  );
};
