import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HashiMiniState, HashiMiniAction, HashiMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HashiMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const hashiMiniPlugin: GamePlugin<HashiMiniState, HashiMiniAction, typeof settings> = {
  id: "hashi-mini",
  title: "Hashi Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect islands with bridges. Bridge counts match island clues.",
  howToPlay: "Hashi (Hashiwokakero, Japanese for \"build bridges\") is a connect-the-islands puzzle. The grid contains islands with numbers indicating how many bridges connect to that island. Bridges run horizontally or vertically between islands, never diagonally. Up to two parallel bridges can connect any pair of islands.\n\nRules: bridges don't cross other bridges; bridges don't pass through islands; the total bridges connecting to each island equals its clue; all islands must be reachable from any other island (one connected component).\n\nIn this mini version each puzzle shows a small grid with islands placed. The prompt asks how many bridges connect a specific island, or whether two islands can be joined by parallel bridges.\n\nSix puzzles per round, scoring 100 each with a 10-point time bonus per remaining second. Wrong picks reveal the right answer.\n\nHashi is a classic Nikoli puzzle that thrives on isolated-island deduction. An island with clue 4 in a corner only has two neighbors, so it must use both as double-bridges. Spotting these forced moves cracks the puzzle open.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as HashiMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".hashiminicyan-num", pulses: 3 }; },
  component: HashiMiniGame,
};
