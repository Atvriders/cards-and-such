import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Minishogi5x5Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const minishogi5x5Plugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "minishogi-5x5",
  title: "Minishogi 5x5",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5x5 Shogi — capture and drop pieces. Place vs random CPU.",
  howToPlay: "Minishogi is a 5x5 reduced version of Japanese Shogi invented by Shigenobu Kusumoto in 1970. It preserves Shogi's signature drop mechanic (captured enemy pieces switch sides and may be re-dropped on the board) on a much smaller, faster grid. In this placement adaptation, the drop mechanic is preserved but movement is simplified.\n\nClick any empty cell to place a P piece. If your placement is orthogonally adjacent to a C piece, you capture it — but unlike chess, the captured piece does NOT vanish; it joins your hand and the count is added to your bonus. After your turn the CPU places a C piece on a random empty cell, similarly capturing P pieces it touches orthogonally.\n\nGameplay lasts up to 18 moves or until the board fills. You earn 100 points for ending with more pieces on the board than the CPU, 25 for a tie, plus 3 points per surviving P piece and 2 points per piece you captured. Orthogonal-only capture geometry means corner cells are very safe — they have only two attacking neighbors.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".msg-board")) ? { selector: ".msg-board", pulses: 3 } : null,
  component: Minishogi5x5Game,
};
