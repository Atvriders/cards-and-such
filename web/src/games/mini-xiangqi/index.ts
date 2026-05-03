import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { MiniXiangqiState, MiniXiangqiAction, MiniXiangqiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniXiangqiGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const miniXiangqiPlugin: GamePlugin<MiniXiangqiState, MiniXiangqiAction, typeof settings> = {
  id: "mini-xiangqi",
  title: "Mini Xiangqi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact 5×6 Xiangqi with King, Cannons, and Soldiers.",
  howToPlay: "Mini Xiangqi is a compact 5×6 version of Chinese chess. Click your piece (red), then click a highlighted destination. Pieces: King moves orthogonally one step; Cannon slides like a rook on empty squares but captures by jumping over exactly one piece; Soldiers march forward and gain sideways movement after crossing midline. Capture the opponent's King to win. The CPU prioritises captures. Real Xiangqi adds Chariots (Rooks), Horses, Elephants, Advisors, and a river — all stripped here for a 5-minute experience that preserves the iconic cannon-jump mechanic.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniXiangqiSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".mxq-board")) ? { selector: ".mxq-board", pulses: 3 } : null,
  component: MiniXiangqiGame,
};
