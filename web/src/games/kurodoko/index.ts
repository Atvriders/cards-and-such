import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KurodokoState, KurodokoAction, KurodokoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KurodokoGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const kurodokoPlugin: GamePlugin<KurodokoState, KurodokoAction, typeof settings> = {
  id: "kurodoko",
  title: "Kurodoko",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells black so each numbered white cell sees exactly that many white cells (including itself) along its row and column. Black cells not adjacent; white cells connected.",
  howToPlay: "Kurodoko (also \"Where is Black?\") shades some cells black across a grid of mostly white cells. Each numbered white cell counts itself plus the white cells visible along its row and column until a black cell or grid edge blocks the view. That total must equal the cell's number.\n\nTwo more rules: (1) black cells may never be orthogonally adjacent to each other, and (2) all white cells must form one connected group.\n\nEach puzzle shows a small grid with numbered hints. A target cell is highlighted with four candidate values: black, white, or distractor descriptors. Apply the visibility, adjacency, and connectivity rules to find the unique correct color.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second time bonus. Wrong picks reveal the correct value. Kurodoko has a satisfying \"just one more cell\" rhythm — every shaded cell tightens the puzzle elegantly.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as KurodokoSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".kurodokomoonlight-num", pulses: 3 }; },
  component: KurodokoGame,
};
