import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AkariMiniState, AkariMiniAction, AkariMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AkariMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const akariMiniPlugin: GamePlugin<AkariMiniState, AkariMiniAction, typeof settings> = {
  id: "akari-mini",
  title: "Akari Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place light bulbs to illuminate all white cells; no bulbs face each other.",
  howToPlay: "Akari (Light Up) places light bulbs in a grid to illuminate every non-black cell. Bulbs cast light along rows and columns until blocked by a black cell or a wall. No two bulbs may illuminate each other, meaning no two bulbs share a row or column without a black cell between them.\n\nBlack cells with numbers indicate the count of orthogonally-adjacent bulbs. Black cells without numbers have no constraint. Cells without bulbs that are reachable from a bulb's light path are illuminated; otherwise they remain dark.\n\nIn this mini version each puzzle shows a small grid with black cells placed and partial bulb placement. The prompt asks where the next bulb must go to satisfy all constraints.\n\nSix puzzles per round, scoring 100 each plus a 10-point time bonus per remaining second. Wrong picks reveal the right cell.\n\nAkari is logical and tactile — bulbs feel like pieces you place on a board. Numbered black cells are deduction anchors: a black-3 has three of its four neighbors as bulbs. Patterns build up from these forced placements until the grid lights up completely.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as AkariMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".akariminiamber-num", pulses: 3 }; },
  component: AkariMiniGame,
};
