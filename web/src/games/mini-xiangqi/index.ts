import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const miniXiangqiPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "mini-xiangqi",
  title: "Mini Xiangqi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "7x7 Xiangqi for fast play.",
  howToPlay: "Mini Xiangqi is a compact 7x7 version of Chinese chess. In this 5x5 placement adaptation across 14 turns (7 each), you place pieces on the grid; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full Mini Xiangqi uses a reduced 7x7 board with simplified piece sets: King, two Cannons, two Knights, and pawns; no advisors or elephants. The river dividing the board is at row 3-4. Mini Xiangqi rounds last 5-10 minutes versus 30+ for full Xiangqi, making it ideal for casual cafe play. Online Mini Xiangqi servers attract thousands of players in mainland China and Hong Kong. Strategy in this placement version: contest the centre. Final scoreboard: 100 points for the win, 25 for a tie. The 7x7 reduction preserves the cannon-jump mechanic that gives Xiangqi its distinctive flavour while reducing the strategic horizon to a manageable level for new players.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
