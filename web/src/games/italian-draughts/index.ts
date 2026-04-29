import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ItalianDraughtsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const italianDraughtsPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "italian-draughts",
  title: "Italian Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian Checkers ruleset — diagonal capture priority. Place vs random CPU.",
  howToPlay: "Italian Draughts (Dama Italiana) is the traditional Italian form of Checkers played on an 8x8 dark-squared board. Italian rules give kings unique movement constraints and require captures whenever available. In this compact placement version, those rules are streamlined.\n\nClick any empty cell to drop a P piece. If your placement creates a diagonal sandwich (your new P with another P flanking a C piece), that C is captured and removed. After your turn, a random CPU places a C piece that may similarly capture P pieces. Multi-captures cascade automatically when chains exist.\n\nGameplay continues for up to 22 moves or until one side runs out of pieces. You earn 100 points for fully eliminating CPU pieces, 50 for finishing ahead in piece count, 25 for a tie, plus 4 points per surviving P piece on the board. Italian rules historically favor methodical defensive play, so prefer placements that build defensive chains rather than risky early aggression. Watch the board diagonals for sandwich opportunities.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: ItalianDraughtsGame,
};
