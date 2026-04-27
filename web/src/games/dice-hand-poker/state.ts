import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Hand Poker: 6 rounds. Roll 5 standard dice. You may re-roll selected dice up to 2 times (3 rolls total).
// At the end, score the best poker hand:
// 5 of a kind: 600, 4 of a kind: 300, full house: 200, straight (1-5 or 2-6): 150,
// 3 of a kind: 100, two pair: 60, one pair: 30, high card: 0.

export const TOTAL_ROUNDS = 6;
export const DICE_COUNT = 5;
export const MAX_ROLLS = 3;

export interface DiceHandPokerSettings { dummy: boolean; }

export interface DiceHandPokerState {
  rngSeed: number;
  round: number;
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  score: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
  lastHand: string;
}

export type DiceHandPokerAction = { type: "roll" } | { type: "toggle"; idx: number } | { type: "next" };

export function evalHand(d: number[]): { name: string; points: number } {
  const sorted = [...d].sort((a,b)=>a-b);
  const counts = new Map<number, number>();
  for (const v of sorted) counts.set(v, (counts.get(v) ?? 0) + 1);
  const cs = [...counts.values()].sort((a,b)=>b-a);
  if (cs[0] === 5) return { name: "5 of a kind", points: 600 };
  if (cs[0] === 4) return { name: "4 of a kind", points: 300 };
  if (cs[0] === 3 && cs[1] === 2) return { name: "Full house", points: 200 };
  if (counts.size === 5) {
    const a = sorted;
    if (a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5) return { name: "Straight", points: 150 };
    if (a[0] === 2 && a[1] === 3 && a[2] === 4 && a[3] === 5 && a[4] === 6) return { name: "Straight", points: 150 };
  }
  if (cs[0] === 3) return { name: "3 of a kind", points: 100 };
  if (cs[0] === 2 && cs[1] === 2) return { name: "Two pair", points: 60 };
  if (cs[0] === 2) return { name: "Pair", points: 30 };
  return { name: "High card", points: 0 };
}

function rollDice(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor(rng() * 6));
  return out;
}

export function initialState(seed: number, _settings: DiceHandPokerSettings): DiceHandPokerState {
  return { rngSeed: seed, round: 1, dice: [0,0,0,0,0], held: [false,false,false,false,false], rollsLeft: MAX_ROLLS, score: 0, phase: "rolling", lastPts: 0, lastHand: "" };
}

export function reducer(state: DiceHandPokerState, action: DiceHandPokerAction): DiceHandPokerState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    if (state.phase !== "rolling" || state.rollsLeft === MAX_ROLLS) return state;
    const held = [...state.held];
    held[action.idx] = !held[action.idx]!;
    return { ...state, held };
  }
  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.rollsLeft <= 0) return state;
    const rng = mulberry32(state.rngSeed);
    const newDice = state.dice.map((d, i) => state.held[i] && state.rollsLeft < MAX_ROLLS ? d : 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rollsLeft = state.rollsLeft - 1;
    if (rollsLeft <= 0) {
      const ev = evalHand(newDice);
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: nextSeed, dice: newDice, rollsLeft: 0, score: state.score + ev.points, phase: isLast ? "done" : "scored", lastPts: ev.points, lastHand: ev.name };
    }
    return { ...state, rngSeed: nextSeed, dice: newDice, rollsLeft };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [0,0,0,0,0], held: [false,false,false,false,false], rollsLeft: MAX_ROLLS, phase: "rolling", lastPts: 0, lastHand: "" };
  }
  return state;
}

export function isTerminal(state: DiceHandPokerState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
