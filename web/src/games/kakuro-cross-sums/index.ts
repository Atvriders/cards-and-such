import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KakuroCrossSumsState, KakuroCrossSumsStateAction, KakuroCrossSumsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KakuroCrossSumsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const kakuroCrossSumsPlugin: GamePlugin<KakuroCrossSumsState, KakuroCrossSumsStateAction, typeof settings> = {
  id: "kakuro-cross-sums",
  title: "Kakuro Cross-Sums",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crossword-style; digit sums for runs; no repeated digits in run.",
  howToPlay: "Kakuro (also called Cross-Sums) is a numeric crossword puzzle. The grid has black cells and white cells; the white cells form horizontal and vertical runs of varying lengths. Each run is preceded by a clue showing the target sum for that run, written in a triangular black cell. You fill the white cells with digits 1 to 9 such that each run's digits sum to the clue and no digit repeats within a run.\n\nA two-cell run summing to 17 must contain {8,9} in some order. A two-cell run summing to 3 must be {1,2}. These narrow patterns make Kakuro deeply deductive — pairs and triples of unique sums anchor the puzzle.\n\nThis quiz presents six Kakuro puzzles, each showing a fragment with a marked cell. The clue sums are visible. Apply the sum and no-repeat rules. Six puzzles per round; 100 points per correct answer plus time bonus. Kakuro veterans memorize unique sum decompositions — the magic Kakuro tables. Pick the digit completing the run.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as KakuroCrossSumsSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".kakurocross-num", pulses: 3 }; },
  component: KakuroCrossSumsGame,
};
