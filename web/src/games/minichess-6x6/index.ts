import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Minichess6x6Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const minichess6x6Plugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "minichess-6x6",
  title: "Minichess 6x6",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact 6x6 chess — capture more pieces than the CPU. Place vs random CPU.",
  howToPlay: "Minichess 6x6 is a small-board chess variant designed for fast strategic games — popularized by computer chess research because the smaller board reduces complexity dramatically. In this placement-style adaptation, the formal opening is replaced by sequential piece placement on an empty 6x6 board.\n\nClick any empty cell to place a P piece. Knight-jump captures: any C piece that sits a knight's-move away (2-and-1 L-shape) from your new P is captured and removed. After your placement, the CPU drops a C piece on a random empty cell, capturing any P pieces that sit a knight's-move from it.\n\nGameplay continues for up to 18 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, 0 for losing, plus 4 points per surviving P piece. Knight-move captures create non-obvious threats — a piece placed in the center of the board can threaten up to eight squares, while a corner placement only threatens two. Edge placements are safer; center placements are more aggressive.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".mc6-board")) ? { selector: ".mc6-board", pulses: 3 } : null,
  component: Minichess6x6Game,
};
