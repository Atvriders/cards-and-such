import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MahjongPagodaSkyGame } from "./Game.js";

const settings = {} as const;

export const mahjongPagodaSkyPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-pagoda-sky",
  title: "Mahjong Pagoda Sky",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a multi-tiered Japanese pagoda silhouette reaching the sky.",
  howToPlay: "Mahjong Pagoda Sky is a Mahjong solitaire layout shaped like a tall multi-tiered pagoda. Three wide stories form the base, two narrower stories sit above, and a small finial rises into the sky on the topmost three layers. Each story narrows from the one below, mimicking traditional eaves.\n\nA tile is free when no tile sits on top AND at least one same-layer side is open. Click a free tile to highlight it, then click another free tile with the same face to remove the matching pair. Mismatches simply transfer your highlight forward.\n\nWork from the top of the spire downward: each layer hides the one below, and the finial is the only path to the upper stories. Once the spire opens up, the broad lower stories become trivially clearable. A perfect clear scores up to ten thousand points minus fifty per move; deadlock ends the run with partial credit.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongPagodaSkyGame,
};
