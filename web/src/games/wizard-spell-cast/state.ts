import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WizardSpellCastSettings {
  length: "4" | "6" | "8";
}

export const RUNES = ["🔥", "💧", "🌿", "⚡", "❄️", "🌀", "☀️", "🌙"];

export interface WizardSpellCastState {
  settings: WizardSpellCastSettings;
  sequence: number[];    // correct rune sequence
  playerInput: number[]; // what player has entered so far
  phase: "show" | "input" | "fail" | "win";
  showIndex: number;     // which element of sequence is highlighted during show phase
  score: number;
  round: number;
}

export type WizardSpellCastAction =
  | { type: "advance-show" }
  | { type: "cast"; rune: number }
  | { type: "next-round" };

function generateSequence(seed: number, length: number): number[] {
  const rng = mulberry32(seed);
  return Array.from({ length }, () => Math.floor(rng() * RUNES.length));
}

export function initialState(seed: number, settings: WizardSpellCastSettings): WizardSpellCastState {
  const length = parseInt(settings.length, 10);
  return {
    settings,
    sequence: generateSequence(seed, length),
    playerInput: [],
    phase: "show",
    showIndex: 0,
    score: 0,
    round: 1,
  };
}

export function reducer(state: WizardSpellCastState, action: WizardSpellCastAction): WizardSpellCastState {
  if (action.type === "advance-show") {
    if (state.phase !== "show") return state;
    const next = state.showIndex + 1;
    if (next >= state.sequence.length) {
      return { ...state, phase: "input", showIndex: next };
    }
    return { ...state, showIndex: next };
  }

  if (action.type === "cast") {
    if (state.phase !== "input") return state;
    const idx = state.playerInput.length;
    const expected = state.sequence[idx];
    if (action.rune !== expected) {
      return { ...state, phase: "fail" };
    }
    const playerInput = [...state.playerInput, action.rune];
    if (playerInput.length === state.sequence.length) {
      const length = parseInt(state.settings.length, 10);
      return {
        ...state,
        playerInput,
        phase: "win",
        score: state.score + length * 100 * state.round,
      };
    }
    return { ...state, playerInput };
  }

  if (action.type === "next-round") {
    if (state.phase !== "win" && state.phase !== "fail") return state;
    const length = parseInt(state.settings.length, 10);
    const newRound = state.phase === "win" ? state.round + 1 : state.round;
    const newSeed = state.sequence.reduce((a, b) => (a * 31 + b) >>> 0, newRound * 1337);
    return {
      ...state,
      sequence: generateSequence(newSeed, length),
      playerInput: [],
      phase: "show",
      showIndex: 0,
      round: newRound,
    };
  }

  return state;
}

export function isTerminal(state: WizardSpellCastState): { score: number } | null {
  if (state.phase === "fail" && state.score > 0) return { score: state.score };
  if (state.phase === "fail") return { score: 0 };
  return null;
}
