import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongSakuraPetalGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongSakuraPetalGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongSakuraPetalPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-sakura-petal",
  title: "Mahjong Sakura Petal",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a five-petal cherry blossom with stacked centre.",
  howToPlay: "Mahjong Sakura Petal is a Mahjong solitaire layout depicting a five-petal cherry blossom: four petals flare outward and a stacked centre of two extra layers gives the flower depth. The petals provide many free tiles from the start while the centre is a small puzzle of its own.\n\nClick any free tile (no tile on top, with at least one open horizontal edge on its layer) to highlight it, then click another free tile bearing the same face to remove the pair. Mismatches transfer your highlight to the latest click.\n\nThe centre stack has only a few tiles and will be free as soon as the topmost layer is removed. Most of the puzzle revolves around sequencing matches across the petals, since petal tiles are easy to free but easy to leave imbalanced if you remove one without its partner. A complete clear earns up to ten thousand points minus fifty per move played.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongSakuraPetalGame,
};
