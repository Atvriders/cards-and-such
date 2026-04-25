import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KeyboardWarriorSettings {
  length: "5" | "10" | "20";
}

// Sequences of single characters the player must type
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export interface KeyboardWarriorState {
  settings: KeyboardWarriorSettings;
  rngSeed: number;
  sequence: string[];   // target sequence of characters
  typed: string[];      // what player has typed so far
  errors: number;
  startTime: number | null;
  endTime: number | null;
  gameOver: boolean;
}

export type KeyboardWarriorAction =
  | { type: "key"; char: string }
  | { type: "start"; time: number };

function generateSequence(rng: () => number, length: number): string[] {
  const seq: string[] = [];
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(rng() * CHARS.length);
    seq.push(CHARS[idx]!);
  }
  return seq;
}

export function initialState(seed: number, settings: KeyboardWarriorSettings): KeyboardWarriorState {
  const length = parseInt(settings.length, 10);
  const rng = mulberry32(seed >>> 0);
  const sequence = generateSequence(rng, length);
  return {
    settings,
    rngSeed: seed >>> 0,
    sequence,
    typed: [],
    errors: 0,
    startTime: null,
    endTime: null,
    gameOver: false,
  };
}

export function reducer(state: KeyboardWarriorState, action: KeyboardWarriorAction): KeyboardWarriorState {
  if (state.gameOver) return state;

  if (action.type === "start") {
    if (state.startTime !== null) return state;
    return { ...state, startTime: action.time };
  }

  if (action.type === "key") {
    if (state.startTime === null) return state;
    const idx = state.typed.length;
    const expected = state.sequence[idx];
    if (expected === undefined) return state;

    const correct = action.char === expected;
    const typed = [...state.typed, action.char];
    const errors = state.errors + (correct ? 0 : 1);
    const gameOver = typed.length >= state.sequence.length;
    const endTime = gameOver ? Date.now() : null;

    return {
      ...state,
      typed,
      errors,
      gameOver,
      endTime,
    };
  }

  return state;
}

export function isTerminal(state: KeyboardWarriorState): { score: number } | null {
  if (!state.gameOver) return null;
  const correct = state.typed.filter((c, i) => c === state.sequence[i]).length;
  const accuracy = correct / state.sequence.length;
  return { score: Math.round(accuracy * 1000 - state.errors * 20) };
}

export function currentIndex(state: KeyboardWarriorState): number {
  return state.typed.length;
}
