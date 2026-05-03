import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongBambooGridGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongBambooGridGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongBambooGridPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-bamboo-grid",
  title: "Mahjong Bamboo Grid",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire on a tight 6x6 grid with a small central two-layer tower.",
  howToPlay: "Mahjong Bamboo Grid is a Mahjong solitaire layout that combines a tight six-by-six grid of layer-0 tiles with a small two-layer-tall central tower made of a 2x2 block on layers 1 and 2. The layout is compact and tactical, demanding quick spotting of matches across the dense grid.\n\nClick a free tile (no tile on top, at least one open same-layer side) to highlight it, then click another free tile with the same face to clear the pair. Mismatches transfer your highlight forward to the latest click.\n\nIn this layout most layer-0 free tiles live on the outer rim of the 6x6 grid, since interior cells have neighbours on both left and right. The central tower must be peeled top-down before the four tiles directly beneath it are free. A perfect clear scores up to ten thousand points minus fifty per move played; deadlock ends the run with proportional credit.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongBambooGridGame,
};
