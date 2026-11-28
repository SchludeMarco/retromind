import { createContext } from 'react';

/**
 * Set around a Blitz game while it is a round against the boss of the day
 * (components/BossFight.tsx, lib/boss.ts): its own random round, a goal shown
 * on the clock, and the score handed to the fight instead of the usual end
 * screen, high score and daily challenge.
 */
export interface BlitzBoss {
  /** Seeds the round, so it isn't the same as today's plain Blitz game. */
  seed: string;
  goal: number;
  /** The clock starts: from here on, walking away counts as a miss. */
  onStart?: () => void;
  onEnd: (score: number) => void;
}

export const BlitzBossContext = createContext<BlitzBoss | null>(null);
