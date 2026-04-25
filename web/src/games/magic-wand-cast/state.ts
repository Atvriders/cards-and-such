import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Magic Wand Cast: A spell is shown (color sequence 3-5 long).
// Player clicks colored orbs in the correct order to cast it.
// 8 spells per game. Wrong orb = restart spell. Time limit per spell.

export type SpellColor = "red" | "blue" | "green" | "yellow" | "purple";

export interface MagicWandCastSettings {
  spells: "5" | "8" | "12";
}

export interface MagicWandCastState {
  spells: SpellColor[][];
  spellIndex: number;
  inputProgress: SpellColor[];
  attemptsOnSpell: number;
  score: number;
  timeLeft: number;
  phase: "casting" | "success" | "timeout" | "gameover";
  rngSeed: number;
}

export type MagicWandCastAction =
  | { type: "cast"; color: SpellColor }
  | { type: "next" }
  | { type: "tick" };

const COLORS: SpellColor[] = ["red", "blue", "green", "yellow", "purple"];

function genSpell(rng: () => number, length: number): SpellColor[] {
  return Array.from({ length }, () => COLORS[Math.floor(rng() * COLORS.length)]!);
}

export function initialState(seed: number, settings: MagicWandCastSettings): MagicWandCastState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.spells, 10);
  const spells = Array.from({ length: count }, (_, i) => genSpell(rng, 3 + (i % 3)));
  return { spells, spellIndex: 0, inputProgress: [], attemptsOnSpell: 0, score: 0, timeLeft: 15, phase: "casting", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: MagicWandCastState, action: MagicWandCastAction): MagicWandCastState {
  if (state.phase === "gameover") return state;
  if (action.type === "tick") {
    if (state.phase !== "casting") return state;
    const newTime = state.timeLeft - 1;
    if (newTime <= 0) {
      const isLast = state.spellIndex >= state.spells.length - 1;
      return { ...state, timeLeft: 0, phase: isLast ? "gameover" : "timeout" };
    }
    return { ...state, timeLeft: newTime };
  }
  if (action.type === "cast") {
    if (state.phase !== "casting") return state;
    const spell = state.spells[state.spellIndex]!;
    const newProgress = [...state.inputProgress, action.color];
    // Check if wrong
    if (action.color !== spell[newProgress.length - 1]) {
      return { ...state, inputProgress: [], attemptsOnSpell: state.attemptsOnSpell + 1 };
    }
    // Correct so far
    if (newProgress.length === spell.length) {
      const pts = Math.max(10, 50 - state.attemptsOnSpell * 10) + state.timeLeft * 2;
      const isLast = state.spellIndex >= state.spells.length - 1;
      return { ...state, inputProgress: newProgress, score: state.score + pts, phase: isLast ? "gameover" : "success" };
    }
    return { ...state, inputProgress: newProgress };
  }
  if (action.type === "next") {
    if (state.phase !== "success" && state.phase !== "timeout") return state;
    return { ...state, spellIndex: state.spellIndex + 1, inputProgress: [], attemptsOnSpell: 0, timeLeft: 15, phase: "casting" };
  }
  return state;
}

export function isTerminal(state: MagicWandCastState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
