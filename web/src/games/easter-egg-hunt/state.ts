import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EasterEggHuntSettings {
  eggs: "5" | "8" | "12";
}

export const ROWS = 6;
export const COLS = 8;

export interface EasterEggHuntState {
  settings: EasterEggHuntSettings;
  eggPositions: Set<number>; // flat indices where eggs hide
  revealed: Set<number>;     // cells the player has clicked
  found: number;
  misses: number;
  maxMisses: number;
  score: number;
  over: boolean;
  won: boolean;
}

export type EasterEggHuntAction = { type: "dig"; index: number };

export function initialState(seed: number, settings: EasterEggHuntSettings): EasterEggHuntState {
  const numEggs = parseInt(settings.eggs, 10);
  const rng = mulberry32(seed);
  const total = ROWS * COLS;
  const positions = new Set<number>();
  while (positions.size < numEggs) {
    positions.add(Math.floor(rng() * total));
  }
  return {
    settings,
    eggPositions: positions,
    revealed: new Set(),
    found: 0,
    misses: 0,
    maxMisses: numEggs + 2,
    score: 0,
    over: false,
    won: false,
  };
}

export function reducer(state: EasterEggHuntState, action: EasterEggHuntAction): EasterEggHuntState {
  if (state.over) return state;
  if (action.type !== "dig") return state;
  const { index } = action;
  if (state.revealed.has(index)) return state;

  const revealed = new Set(state.revealed);
  revealed.add(index);

  const isEgg = state.eggPositions.has(index);
  const found = state.found + (isEgg ? 1 : 0);
  const misses = state.misses + (isEgg ? 0 : 1);
  const numEggs = parseInt(state.settings.eggs, 10);
  const won = found === numEggs;
  const lost = misses >= state.maxMisses;
  const over = won || lost;
  const scoreGain = isEgg ? Math.max(10, 50 - misses * 5) : 0;

  return {
    ...state,
    revealed,
    found,
    misses,
    score: state.score + scoreGain,
    over,
    won,
  };
}

export function isTerminal(state: EasterEggHuntState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
