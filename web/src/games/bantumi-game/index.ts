import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BantumiGameGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bantumiGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "bantumi-game",
  title: "Bantumi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simplified Kalah — sow seeds across a small grid. Place vs random CPU.",
  howToPlay: "Bantumi is a simplified version of the classic Kalah Mancala, popularized by an old Nokia mobile-phone game in the late 1990s. The original is played on two rows of 6 pits with players sowing seeds counterclockwise. In this 4x4 grid placement adaptation, the sow-and-store concept is reimagined as a tactical placement game.\n\nClick any empty cell to place a P piece. If your placement is on a cell in column 3 (the rightmost column, your store), every adjacent C piece in column 2 is captured and removed. After your turn, a random CPU places a C piece on an empty cell that may symmetrically capture P pieces in column 1 if it lands on column 0 (its store).\n\nGameplay lasts up to 14 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 4 points per surviving P piece. The asymmetric store-column structure rewards opportunistic placement — wait until the CPU has placed multiple pieces in column 2, then drop your store-column placement to capture all of them in one swoop.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: BantumiGameGame,
};
