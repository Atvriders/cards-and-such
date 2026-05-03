import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShatranjArabicGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const shatranjArabicPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "shatranj-arabic",
  title: "Shatranj (Arabic Chess)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Historical Arabic Chess ancestor — capture more pieces. Place vs random CPU.",
  howToPlay: "Shatranj is the medieval Arabic ancestor of modern chess, played on an 8x8 board with simpler piece movement than the modern game. The ferz (counselor) moved one square diagonally, the alfil (elephant) jumped exactly two squares diagonally. In this compact placement adaptation, those constrained moves shape capture geometry.\n\nClick any empty cell to place a P piece. Your placement captures any C piece that sits exactly two squares away diagonally (the alfil jump pattern) — these C pieces are removed. After your turn, a random CPU places a C piece on a random empty cell that captures any P pieces sitting two squares away diagonally.\n\nGameplay lasts up to 20 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 4 points per surviving P piece. The two-square diagonal jump produces unusual non-adjacent threat patterns — your pieces are NOT vulnerable to neighboring CPU pieces, only to those exactly two squares diagonally. Edge placements are particularly safe since fewer of those diagonals exist.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".shz-board")) ? { selector: ".shz-board", pulses: 3 } : null,
  component: ShatranjArabicGame,
};
