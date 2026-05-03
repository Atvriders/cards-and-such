import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrizzledOrdersState, GrizzledOrdersAction, GrizzledOrdersSettings } from "./state.js";
import { GrizzledOrders_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const GrizzledOrdersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GrizzledOrdersGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const grizzledOrdersPlugin: GamePlugin<GrizzledOrdersState, GrizzledOrdersAction, typeof settings> = {
  id: "grizzled-orders",
  title: "The Grizzled: Orders",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Armistice add-on missions for The Grizzled.",
  howToPlay: "The Grizzled: Orders is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrizzledOrdersSettings),
  reducer,
  isTerminal,
  hint: (state: GrizzledOrdersState): HintTarget | null => {
    const sel = coopHintSelector(state, GrizzledOrders_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: GrizzledOrdersGame,
};

export default grizzledOrdersPlugin;
