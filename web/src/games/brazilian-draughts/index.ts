import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BrazilianDraughtsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const brazilianDraughtsPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "brazilian-draughts",
  title: "Brazilian Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "8x8 flying-kings Checkers variant — capture all CPU pieces. Diagonal-only moves vs random CPU.",
  howToPlay: "Brazilian Draughts is a popular South American variant of Checkers played on an 8x8 board with flying kings — kings that may move and capture along diagonals across any number of empty squares. In this compact placement-style variant, the rules have been simplified for quick play.\n\nThe board starts with five P pieces along your bottom-left diagonal and five C pieces in the opposite corner. Click any empty board cell to place a P piece. Pieces touching opposing pieces diagonally count as captures — those CPU pieces are removed from the board. A random CPU then places a C piece, which can also capture any P pieces it touches diagonally.\n\nGameplay continues for up to 20 moves or until one side has no remaining pieces on the board. You earn 100 points for eliminating all CPU pieces, 50 for ending with more pieces than the CPU, 25 for a tie, plus 5 points per surviving P piece. Because the CPU places randomly, you can often pre-engineer multi-capture diagonal chains.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: BrazilianDraughtsGame,
};
