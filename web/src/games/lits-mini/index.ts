import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LitsMiniState, LitsMiniAction, LitsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LitsMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const litsMiniPlugin: GamePlugin<LitsMiniState, LitsMiniAction, typeof settings> = {
  id: "lits-mini",
  title: "LITS Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place L, I, T, or S tetrominoes — same-shape adjacency illegal.",
  howToPlay: "LITS is a tetromino-placement puzzle named for the four shapes used: L, I, T, and S (no O — the 2x2 square is forbidden). The grid is divided into regions; each region must contain exactly one tetromino chosen from L, I, T, or S.\n\nRules: each region holds one tetromino; tetrominoes from adjacent regions cannot share an edge if they are the same shape; no 2x2 block of shaded cells is allowed; all shaded cells together must form one connected region.\n\nIn this mini version each puzzle shows a small grid with regions outlined and one tetromino placed. The prompt asks which shape fits the next region, or whether a specific placement is legal.\n\nSix puzzles per round, scoring 100 points each plus a 10-point time bonus per remaining second. Wrong picks reveal the right answer.\n\nLITS is a tetromino-genealogy game — your knowledge of how shapes connect carries you. The forbidden same-shape adjacency is the central tension; once you place a piece, it dictates options for neighbors. Reading the regions is the key skill.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as LitsMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".litstetris-num", pulses: 3 }; },
  component: LitsMiniGame,
};
