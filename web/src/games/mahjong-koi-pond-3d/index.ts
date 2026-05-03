import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongKoiPond3dGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongKoiPond3dGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongKoiPond3DPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-koi-pond-3d",
  title: "Mahjong Koi Pond 3D",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a tiered 3D koi pond with deeper centre stacks.",
  howToPlay: "Mahjong Koi Pond 3D is a Mahjong solitaire layout depicting a tiered koi pond, with a wide square pond surface as layer 0, a narrower square inner ring as layer 1, and a small two-tile layer 2 koi peak at the centre representing the brightest fish breaking the surface.\n\nClick a free tile (no tile on top, at least one open same-layer side) to highlight it, then click a second free tile with the same face to clear the pair. Mismatches simply switch the highlight to the latest click.\n\nThe layer-2 koi peak is always free; clearing it is the first step to unlocking the inner ring beneath, which in turn opens the broad pond surface. Try to keep enough matching pairs in reserve for the wide pond beneath, since that is where many tiles live. A perfect clear scores up to ten thousand points minus fifty per move played.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongKoiPond3dGame,
};
