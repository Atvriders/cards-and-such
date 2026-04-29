import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AyoMancalaGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ayoMancalaPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "ayo-mancala",
  title: "Ayo (Yoruba Mancala)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yoruba Mancala variant on 5x5 — sow seeds and capture. Place vs random CPU.",
  howToPlay: "Ayo is the Yoruba Mancala game played in West Africa, particularly Nigeria, on two rows of 6 pits with 4 seeds each. Unlike many Mancalas, Ayo uses a single-lap sowing rule and has unique capture conditions on the opponent's side. In this compact 5x5 placement adaptation, the cross-side capture spirit is preserved.\n\nClick any empty cell to place a P piece. If your placement lands in the upper half (rows 0-1, the CPU's territory), every C piece in the same column is captured and removed. After your turn, a random CPU places a C piece that may symmetrically capture P pieces if it lands in the lower half (rows 3-4, your territory) — column-line capture.\n\nGameplay continues for up to 18 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 4 points per surviving P piece. The cross-territory capture rule incentivizes aggressive placement on the CPU's side rather than safe defensive placement on your own. Watch which columns the CPU has accumulated pieces in.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: AyoMancalaGame,
};
