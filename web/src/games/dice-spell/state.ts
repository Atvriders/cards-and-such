import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Spell: 10 rounds. Each round shows a 5-letter target word. Roll 5 dice.
// Each die maps to a letter group via face value (1-6 maps to letter sets).
// Award 5 points per die that "matches" a letter in the target word.

export const TOTAL_ROUNDS = 10;
export const WORDS = ["DICED", "WORLD", "STORM", "BRAVE", "PLATE", "GRAPE", "FROST", "CLEAR", "SHINE", "QUICK", "FLAME", "STONE", "RIVER", "MOUNT", "EMBER"];

export interface DiceSpellSettings { dummy: boolean; }

export interface DiceSpellState {
  rngSeed: number;
  round: number;
  word: string;
  dice: number[];
  matches: number;
  pts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}

export type DiceSpellAction = { type: "roll" } | { type: "next" };

// Map die face 1..6 to letter groups (rough A-Z partition).
// 1: A-E, 2: F-J, 3: K-O, 4: P-T, 5: U-Y, 6: Z and wildcards (any letter).
function letterToGroup(ch: string): number {
  const c = ch.charCodeAt(0) - "A".charCodeAt(0);
  if (c < 0) return -1;
  if (c <= 4) return 1;
  if (c <= 9) return 2;
  if (c <= 14) return 3;
  if (c <= 19) return 4;
  if (c <= 24) return 5;
  return 6;
}

function rollDice(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor(rng() * 6));
  return out;
}

function pickWord(rng: () => number): string {
  return WORDS[Math.floor(rng() * WORDS.length)]!;
}

export function initialState(seed: number, _settings: DiceSpellSettings): DiceSpellState {
  const rng = mulberry32(seed);
  const word = pickWord(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, word, dice: [], matches: 0, pts: 0, score: 0, phase: "rolling" };
}

export function reducer(state: DiceSpellState, action: DiceSpellAction): DiceSpellState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, 5);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let matches = 0;
    for (let i = 0; i < state.word.length; i++) {
      const want = letterToGroup(state.word[i]!);
      if (dice[i] === want || dice[i] === 6) matches++;
    }
    const pts = matches * 5;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, matches, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed);
    const word = pickWord(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, word, dice: [], matches: 0, pts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceSpellState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
