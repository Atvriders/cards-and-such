import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongBambooForestGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongBambooForestGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongBambooForestPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-bamboo-forest",
  title: "Mahjong Bamboo Forest",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire arranged as six tall bamboo columns with leafy caps.",
  howToPlay: "Mahjong Bamboo Forest is a Mahjong solitaire layout shaped like six tall bamboo columns standing in a clearing, each five tiles high with a single-tile cap rising one or two layers above some columns to suggest leaves. The layout is sparser than typical solitaires, emphasising vertical rhythm.\n\nA tile is free when nothing rests directly on top AND at least one of its left or right same-layer edges has no neighbour. Click any glowing free tile to highlight it, then click a second free tile with the same face to remove the pair. Mismatches transfer the highlight to the latest click.\n\nBecause the columns are tall but separated, almost every tile has open horizontal edges, so the main challenge is matching faces rather than uncovering them. The leafy caps must be peeled in layer order. A perfect clear scores up to ten thousand points; deadlocks end the run with partial credit for tiles removed.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongBambooForestGame,
};
