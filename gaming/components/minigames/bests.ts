// Labels for the best result of each mini game ("High score: 1,200 points").
// They live apart from the games so the hall and the Hall of Fame can show a
// record without loading the game itself; each game is loaded only when it is
// opened (MiniGames.tsx).
import { tr } from '../../../lib/i18n';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const QUIZ_ROUNDS = 5;

export const asteroidsBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
export const blackjackBest = (n: number) => tr(`Best: ${n} chips`, `Bestes Spiel: ${n} Chips`);
export const blitzBest = (n: number) => tr(`High score: ${n}`, `Rekord: ${n}`);
export const blocksBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
export const breakoutBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
export const copterBest = (n: number) => tr(`Record: ${n} m`, `Rekord: ${n} m`);
export const froggerBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
export const invadersBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
export const mergeBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
export const missileBest = (n: number) => tr(`High score: ${n.toLocaleString('en-US')} points`, `Rekord: ${n.toLocaleString('de-DE')} Punkte`);
export const pacmanBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
export const pinballBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
export const quizBest = (n: number) => tr(`Best: ${n} of ${QUIZ_ROUNDS} right`, `Bestes Quiz: ${n} von ${QUIZ_ROUNDS} richtig`);
export const snakeBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
export const solitaireBest = (n: number) => tr(`Best time: ${fmt(n)}`, `Bestzeit: ${fmt(n)}`);
export const sudokuBest = (n: number) => tr(`Best time: ${fmt(n)}`, `Bestzeit: ${fmt(n)}`);
export const pokerBest = (n: number) => tr(`Best: ${n} credits`, `Bestes Spiel: ${n} Credits`);
