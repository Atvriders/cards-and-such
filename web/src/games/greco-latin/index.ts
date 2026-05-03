import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { GrecoLatinState, GrecoLatinAction, GrecoLatinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrecoLatinGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const grecoLatinPlugin: GamePlugin<GrecoLatinState, GrecoLatinAction, typeof settings> = {
  id: "greco-latin",
  title: "Greco Latin",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two overlapping Latin squares — no symbol pair repeats.",
  howToPlay: "A Greco-Latin Square (or Euler square) overlays two Latin squares so that every cell holds a pair of symbols (one Greek letter, one Latin letter). The rules: each Greek letter appears exactly once per row and column; each Latin letter appears exactly once per row and column; no Greek-Latin pair repeats anywhere in the grid.\n\nIn this mini version each puzzle shows a small grid with one or two pairs filled in. The prompt asks which pair fits a specific cell to satisfy all three constraints.\n\nSize: 3x3 or 4x4. Each cell holds two letters: an uppercase Latin (A, B, C, D) and a lowercase Greek (α, β, γ, δ). For input simplicity we use plain Latin (A-D) for the second symbol too, distinguishing them by position.\n\nSix puzzles per round, scoring 100 each plus a 10-point time bonus per remaining second. Wrong picks reveal the right pair. Euler famously conjectured that no Greco-Latin square exists for n=6 — disproved in 1959. The 4x4 version exists, is unique up to symmetry, and is a treat to solve.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as GrecoLatinSettings),
  reducer,
  isTerminal,
  
  hint: (state: GrecoLatinState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-greco-latin-answer-0"]', pulses: 3 } : null,component: GrecoLatinGame,
};
