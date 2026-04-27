import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Dice Derby: roll 6 dice, count number of 6s. First to accumulate 3 sixes "wins" the race.
// 5 races. Win = +20 points. You roll a fixed number of times per race; if you don't get 3 sixes, no points.
// Each race auto-rolls until target met or 12 rolls done.
export const TOTAL_RACES = 5;
export const ROLLS_PER_RACE = 12;
export const TARGET_SIXES = 3;
export interface DiceDerbySettings { dummy: boolean; }
export interface DiceDerbyState {
  rngSeed: number;
  race: number;
  rollNum: number;
  sixes: number;
  lastRoll: [number, number, number, number, number, number] | null;
  score: number;
  phase: "racing" | "raceDone" | "done";
  raceWon: boolean;
}
export type DiceDerbyAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceDerbySettings): DiceDerbyState {
  return { rngSeed: seed, race: 1, rollNum: 0, sixes: 0, lastRoll: null, score: 0, phase: "racing", raceWon: false };
}
export function reducer(state: DiceDerbyState, action: DiceDerbyAction): DiceDerbyState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "racing") {
    const rng = mulberry32(state.rngSeed);
    const dice = [0, 0, 0, 0, 0, 0].map(() => 1 + Math.floor(rng() * 6)) as [number, number, number, number, number, number];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newSixes = state.sixes + dice.filter(d => d === 6).length;
    const newRollNum = state.rollNum + 1;
    let raceWon = false;
    let scoreInc = 0;
    let raceDone = false;
    if (newSixes >= TARGET_SIXES) { raceWon = true; scoreInc = 20; raceDone = true; }
    else if (newRollNum >= ROLLS_PER_RACE) { raceDone = true; }
    const isLastRace = state.race >= TOTAL_RACES;
    return { ...state, rngSeed: nextSeed, rollNum: newRollNum, sixes: newSixes, lastRoll: dice, score: state.score + scoreInc, phase: raceDone ? (isLastRace ? "done" : "raceDone") : "racing", raceWon };
  }
  if (action.type === "next" && state.phase === "raceDone") {
    return { ...state, race: state.race + 1, rollNum: 0, sixes: 0, lastRoll: null, phase: "racing", raceWon: false };
  }
  return state;
}
export function isTerminal(state: DiceDerbyState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
