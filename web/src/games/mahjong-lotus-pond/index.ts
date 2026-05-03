import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongLotusPondGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongLotusPondGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongLotusPondPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-lotus-pond",
  title: "Mahjong Lotus Pond",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire arranged as a lotus floating in a still pond, with a tall stamen.",
  howToPlay: "Mahjong Lotus Pond is a Mahjong solitaire layout depicting a still water pond with a five-tile-square frame surrounding inner petals and a tall four-layer stamen rising from the centre. The deep stack of the central stamen forces a top-down clearance strategy that contrasts with the broad open frame.\n\nClick any free tile (no tile on top, at least one open side) to highlight it. Click another free tile with the same face to remove both. Mismatched clicks just swap your highlight forward. Watch the centre carefully — the stamen must be pulled apart layer by layer, while the wide outer frame can be cleared at leisure once you have built up matching pairs.\n\nVictory comes when every tile is removed; deadlock ends the round when no matching free pair remains. A perfect clear earns up to ten thousand points minus fifty per move; partial clears earn proportional credit for removed tiles.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongLotusPondGame,
};
