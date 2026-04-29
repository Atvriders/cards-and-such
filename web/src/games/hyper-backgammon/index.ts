import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HyperBackgammonGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hyperBackgammonPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "hyper-backgammon",
  title: "Hyper-Backgammon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "3-piece Backgammon variant — fast race game. Place vs random CPU.",
  howToPlay: "Hyper-Backgammon is a fast variant of Backgammon where each player has only 3 checkers instead of the standard 15, played on the same board geometry. Games complete in just a few minutes thanks to the reduced piece count. In this compact 5x5 grid placement adaptation, the speed and race-direction spirit are preserved through scoring zones.\n\nClick any empty cell to place a P piece. The board has two race zones: cells in rows 0-1 are CPU's home (where you want to place) worth 3 points each, and cells in rows 3-4 are your home (defensive) worth 1 point each. Middle-row (row 2) placements score 2 points. After your turn, a random CPU places a C piece on a random empty cell.\n\nGameplay continues for up to 12 moves or until the board fills (very fast). You earn 100 points if your zone-weighted score exceeds the CPU's, 25 for a tie, plus your zone-weighted score. The compressed race rewards immediate aggression — head straight for the top rows (CPU home) on every move. Defensive bottom-row placement is the worst strategy.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: HyperBackgammonGame,
};
