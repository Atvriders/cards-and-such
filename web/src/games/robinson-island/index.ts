import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RobinsonIslandState, RobinsonIslandAction, RobinsonIslandSettings } from "./state.js";
import { RobinsonIsland_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const RobinsonIslandGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RobinsonIslandGame as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const robinsonIslandPlugin: GamePlugin<RobinsonIslandState, RobinsonIslandAction, typeof settings> = {
  id: "robinson-island",
  title: "Robinson: Island",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Robinson Crusoe scenario pack.",
  howToPlay: "Robinson: Island is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RobinsonIslandSettings),
  reducer,
  isTerminal,
  hint: (state: RobinsonIslandState): HintTarget | null => {
    const sel = coopHintSelector(state, RobinsonIsland_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: RobinsonIslandGame,
};

export default robinsonIslandPlugin;
