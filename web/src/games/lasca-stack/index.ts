import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LascaStackGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const lascaStackPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "lasca-stack",
  title: "Lasca",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Checkers variant where captured pieces stack instead of being removed. Place vs random CPU.",
  howToPlay: "Lasca is a Checkers variant invented by world-chess-champion Emanuel Lasker in 1911 where captured pieces are not removed — they stack underneath the capturing piece, forming towers (called Officers or Soldiers). The top piece of each stack determines its color and movement. In this compact 7x7 placement adaptation, the stacking mechanic shapes the scoring directly.\n\nClick any empty cell to place a P piece. If your placement is orthogonally adjacent to a C piece, you capture it — but instead of removing the C, both pieces remain on the board and the C cell counts as captured (worth 2 points to you). After your turn, a random CPU places a C piece that may symmetrically capture P pieces.\n\nGameplay lasts up to 22 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 2 points per stacked capture and 3 points per surviving P piece. The non-removal mechanic means board congestion grows quickly — early aggressive play to lock in capture stacks is rewarded heavily.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: LascaStackGame,
};
