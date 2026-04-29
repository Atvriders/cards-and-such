import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongTeaPotGame } from "./Game.js";

const settings = {} as const;

export const mahjongTeaPotPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-tea-pot",
  title: "Mahjong Tea Pot",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a Japanese teapot with spout, handle, and lid.",
  howToPlay: "Mahjong Tea Pot is a Mahjong solitaire layout depicting a traditional Japanese teapot: a tall round body, a small layered spout extending to the right, a side handle on the left, and a stacked lid with a knob at the top of the body. The lid stack and inner body stack each rise one layer above the rest.\n\nClick a free tile (no tile on top, at least one open same-layer side) to highlight it, then click another free tile with the same face to clear the pair. Mismatches transfer your highlight to the new tile.\n\nThe lid knob and inner body must be peeled down before the deepest tiles in the body become accessible. The spout and handle are flat and open from the start, providing fresh free tiles to use as you whittle the lid down. A perfect clear scores up to ten thousand points minus fifty per move played; deadlock ends with partial credit for removed tiles.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: MahjongTeaPotGame,
};
