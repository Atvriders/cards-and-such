import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "../_shared/mahjongEngine.js";
import { mahjongHint } from "../_shared/mahjongEngine.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MahjongCraneFormationGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MahjongCraneFormationGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const mahjongCraneFormationPlugin: GamePlugin<MahjongState, MahjongAction, typeof settings> = {
  id: "mahjong-crane-formation",
  title: "Mahjong Crane Formation",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mahjong solitaire shaped like a crane in flight with outstretched wings.",
  howToPlay: "Mahjong Crane Formation is a Mahjong solitaire layout depicting a graceful Japanese crane in flight, with a long extended neck, broad outstretched wings, narrow legs, and a small layered hump on the body's back. The wings stretch wide along the horizontal axis, giving plenty of free edges from the start.\n\nA free tile has no tile directly on top AND has at least one of its left or right same-layer edges open. Click a free tile to highlight it in blue, then click another free tile with the same face to clear the pair. Mismatches transfer the highlight rather than losing it.\n\nThe wide wings are easy to clear early but the central body's stacked hump must be peeled top-down before its lower tiles open up. The game ends in victory when every tile is removed or in deadlock when no matching pair remains. Quick wins earn close to ten thousand points minus fifty per move played.",
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: mahjongHint,
  component: MahjongCraneFormationGame,
};
