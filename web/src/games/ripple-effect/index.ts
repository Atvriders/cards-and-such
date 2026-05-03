import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RippleEffectState, RippleEffectAction, RippleEffectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RippleEffectGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const rippleEffectPlugin: GamePlugin<RippleEffectState, RippleEffectAction, typeof settings> = {
  id: "ripple-effect",
  title: "Ripple Effect",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill regions with 1-N (N = region size). Two cells sharing the same digit must have at least N empty cells between them in their row or column.",
  howToPlay: "Ripple Effect (Hakyuu) divides the grid into regions and asks you to fill each region with 1 through N, where N is the region's size. The twist: any two cells with the same digit, whether in the same region or not, must have at least that digit's worth of empty cells between them along their row or column.\n\nSo two 3s in the same row need at least three cells between them. Two 1s next to each other? Forbidden — there must be at least one cell separating them.\n\nEach puzzle shows a small grid with regions outlined and some givens placed. A target cell is highlighted with four candidate digits. Use the region-size rule and the digit-separation rule to choose the unique value.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second speed bonus. Wrong picks reveal the correct digit so you can build intuition. Ripple Effect feels like Sudoku flavored with social distancing — gentle to start, satisfying to complete.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as RippleEffectSettings),
  reducer,
  isTerminal,
  
  hint: (state: RippleEffectState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-ripple-effect-answer-0"]', pulses: 3 } : null,component: RippleEffectGame,
};
