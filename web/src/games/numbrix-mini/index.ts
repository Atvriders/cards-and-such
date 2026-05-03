import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NumbrixMiniState, NumbrixMiniAction, NumbrixMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumbrixMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const numbrixMiniPlugin: GamePlugin<NumbrixMiniState, NumbrixMiniAction, typeof settings> = {
  id: "numbrix-mini",
  title: "Numbrix Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill grid with consecutive numbers 1 to N forming a path connected only orthogonally (no diagonals).",
  howToPlay: "Numbrix Mini is a Hidato-like puzzle made famous by Marilyn vos Savant in Parade Magazine. Fill a small grid with consecutive numbers 1 through N (where N is the cell count) so that successive numbers — 1 next to 2, 2 next to 3, and so on — sit on cells that share an edge. Diagonal connections are NOT allowed in Numbrix (this is the key difference from Hidato).\n\nA few cells start filled with anchor numbers. Your job: identify which cell holds a specific value or which value goes in a specific cell.\n\nEach puzzle shows a small grid (3x3 or 4x4) with some anchors placed. A target cell or value is highlighted, and four candidate digits offer possibilities. Use the orthogonal-path rule to deduce the answer.\n\nSix puzzles per round; 100 points per correct answer plus a time bonus. Wrong picks reveal the correct value. Numbrix is a clean, satisfying logic puzzle — once you find the start of a chain, the rest often unspools quickly.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as NumbrixMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".numbrixchrome-num", pulses: 3 }; },
  component: NumbrixMiniGame,
};
